import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' // 추가
import './index.css'
import App from './App.tsx'


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, // 창 포커싱
      retry: 1, // 1번 재시도
      staleTime: 1000 * 60 * 5, // 5분제한
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 2. Provider로 감싸기 */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)