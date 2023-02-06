import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { Provider } from 'urql'
import { createClient } from 'urql'

const hasuraToken =
    '74uQPhoBYpcb1XRHF1q94p5jKGG7NjkO8BbLbFdB5zGzeN3z12k3jfYmq55G7z8L'

const client = createClient({
    url: 'https://well-gazelle-52.hasura.app/v1/graphql',
    fetchOptions: () => {
        return {
            headers: { 'x-hasura-admin-secret': hasuraToken },
        }
    },
})

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
    <React.StrictMode>
        <Provider value={client}>
            <App />
        </Provider>
    </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
