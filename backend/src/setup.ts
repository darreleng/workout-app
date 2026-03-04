import 'dotenv/config';

process.env.RESEND_API_KEY = 're_mock_123';
process.env.BETTER_AUTH_SECRET = 'mock_secret_123';

vi.mock('resend', () => ({
    Resend: class {
        emails = {
            send: vi.fn().mockResolvedValue({ id: 'mock-id' })
        }
    }
}));