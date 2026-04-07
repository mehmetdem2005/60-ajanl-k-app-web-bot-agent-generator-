import Fastify from 'fastify';
import cors from '@fastify/cors';

type AgentEndpoint = {
  agent_id: string;
  status?: string;
  capabilities?: string[];
  [key: string]: unknown;
};

class RegistryService {
  private agents = new Map<string, AgentEndpoint>();

  register(endpoint: AgentEndpoint): void {
    this.agents.set(endpoint.agent_id, { ...endpoint, status: endpoint.status ?? 'online' });
  }

  heartbeat(agentId: string): void {
    const current = this.agents.get(agentId);
    if (current) this.agents.set(agentId, { ...current, status: 'online' });
  }

  discover(agentId: string): AgentEndpoint | undefined {
    return this.agents.get(agentId);
  }

  list(capability?: string): AgentEndpoint[] {
    const agents = Array.from(this.agents.values());
    if (!capability) return agents;
    return agents.filter(agent => Array.isArray(agent.capabilities) && agent.capabilities.includes(capability));
  }

  deregister(agentId: string): void {
    this.agents.delete(agentId);
  }
}

const registry = new RegistryService();
const app = Fastify({ logger: true });

app.register(cors, { origin: true });

app.get('/health', async () => ({
  status: 'ok',
  service: 'registry',
  timestamp: Date.now(),
  uptime_ms: process.uptime() * 1000
}));

app.post<{ Body: AgentEndpoint }>('/api/v1/register', async (request, reply) => {
  try {
    const endpoint = request.body;
    registry.register(endpoint);
    return { status: 'registered', agent_id: endpoint.agent_id, timestamp: Date.now() };
  } catch (error) {
    return reply.code(400).send({ error: 'Invalid registration payload', message: error instanceof Error ? error.message : 'Unknown' });
  }
});

app.post<{ Params: { agentId: string } }>('/api/v1/heartbeat/:agentId', async (request) => {
  const { agentId } = request.params;
  registry.heartbeat(agentId);
  return { status: 'ok', agent_id: agentId, timestamp: Date.now() };
});

app.get<{ Params: { agentId: string } }>('/api/v1/discover/:agentId', async (request, reply) => {
  const agent = registry.discover(request.params.agentId);
  if (!agent) {
    return reply.code(404).send({ error: 'Agent not found or offline', agent_id: request.params.agentId });
  }
  return agent;
});

app.get<{ Querystring: { capability?: string } }>('/api/v1/agents', async (request) => {
  const { capability } = request.query;
  const agents = registry.list(capability);
  return {
    agents,
    count: agents.length,
    timestamp: Date.now()
  };
});

app.delete<{ Params: { agentId: string } }>('/api/v1/deregister/:agentId', async (request) => {
  registry.deregister(request.params.agentId);
  return { status: 'deregistered', agent_id: request.params.agentId, timestamp: Date.now() };
});

export default app;
