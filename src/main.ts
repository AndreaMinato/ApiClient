import { ApiClient } from '../lib/main'



const TestClient = new ApiClient(
    "https://jsonplaceholder.typicode.com"
);


TestClient.get('/todos/1').then(console.log)
