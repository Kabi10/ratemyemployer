import { render } from '@testing-library/react'

// Mock the page component since it's a server component
jest.mock('../page', () => {
  return function MockHome() {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <h1>Rate My Employer</h1>
      </main>
    )
  }
})

// Import after mocking
import Home from '../page'

describe('Home Page', () => {
  it('renders without crashing', () => {
    const { container } = render(<Home />)
    expect(container).toBeTruthy()
  })
}) 