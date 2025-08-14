import '@testing-library/jest-dom'

// Polyfills for Node.js environment
import { TextDecoder, TextEncoder } from 'util'

// Only set if not already defined
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder
}

// Add BroadcastChannel polyfill for MSW
global.BroadcastChannel = class BroadcastChannel {
  constructor(name) {
    this.name = name
  }
  postMessage() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
}

// Mock fetch for Node environment
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  })
)

// Mock Request and Response for MSW
global.Request = class MockRequest {
  constructor(url, options = {}) {
    this.url = url
    this.method = options.method || 'GET'
    this.headers = new Map(Object.entries(options.headers || {}))
    this.body = options.body
  }
}

global.Response = class MockResponse {
  constructor(body, options = {}) {
    this.body = body
    this.status = options.status || 200
    this.statusText = options.statusText || 'OK'
    this.headers = new Map(Object.entries(options.headers || {}))
    this.ok = this.status >= 200 && this.status < 300
  }
  
  json() {
    return Promise.resolve(JSON.parse(this.body))
  }
  
  text() {
    return Promise.resolve(this.body)
  }
}

global.Headers = class MockHeaders extends Map {
  constructor(init) {
    super()
    if (init) {
      if (typeof init === 'object') {
        for (const [key, value] of Object.entries(init)) {
          this.set(key, value)
        }
      }
    }
  }
}

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock window object and globals
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock window global methods for achievement system
Object.defineProperty(global, 'window', {
  value: {
    ...window,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    showAchievement: undefined,
    showMultipleAchievements: undefined,
    dispatchEvent: jest.fn(),
    location: {
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
    },
  },
  writable: true,
})

// Ensure window is available globally
global.window = global.window

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock WebSocket for testing socket connections
global.WebSocket = class WebSocket {
  constructor(url) {
    this.url = url
    this.readyState = WebSocket.CONNECTING
  }
  
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3
  
  send() {}
  close() {}
}

// Global test utilities
global.testUtils = {
  createMockAchievement: (overrides = {}) => ({
    id: 1,
    name: 'Test Achievement',
    description: 'A test achievement',
    condition_type: 'Questions Answered',
    condition_value: 10,
    AchievementCategories: { name: 'Gameplay' },
    ...overrides
  }),
  
  createMockUser: (overrides = {}) => ({
    id: 1,
    username: 'testuser',
    elo: 1200,
    xp: 500,
    ...overrides
  }),
  
  createMockQuestion: (overrides = {}) => ({
    Q_id: 1,
    questionText: 'What is 2 + 2?',
    answers: [
      { answer_text: '4', isCorrect: true },
      { answer_text: '3', isCorrect: false },
    ],
    ...overrides
  })
}

// Suppress console.log in tests unless NODE_ENV is test-debug
if (process.env.NODE_ENV === 'test' && !process.env.DEBUG) {
  console.log = jest.fn()
  console.warn = jest.fn()
}
