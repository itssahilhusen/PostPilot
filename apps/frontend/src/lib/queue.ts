// MOCKED — in-memory queue stub for offline/local environments without Redis
const jobs: Array<{ name: string; data: any }> = [];

export const postQueue = {
  add: async (name: string, data: any) => {
    jobs.push({ name, data });
    return { id: `mock-job-${Date.now()}`, name, data };
  },
};

export function createPublishWorker(handler: (postId: string) => Promise<void>) {
  return {
    close: async () => {},
    on: () => {},
  };
}
