const http = require('http');

const options = {
  hostname: 'localhost',
  port: 9005,
  headers: {
    'Content-Type': 'application/json'
  }
};

async function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const reqOpts = { ...options, method, path };
    if (token) reqOpts.headers['Authorization'] = 'Bearer ' + token;
    
    const req = http.request(reqOpts, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, data: parsed || body });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTest() {
  try {
    console.log("1. Logging in as Team Lead Arun...");
    let res = await request('POST', '/auth/login', { email: 'arun@taskflow.com', password: 'password' });
    if (res.status !== 200) throw new Error("Arun login failed: " + JSON.stringify(res));
    const arunToken = res.data.token;

    console.log("2. Fetching developers to find Rahul and Aditya...");
    res = await request('GET', '/api/users/all', null, arunToken);
    const users = res.data;
    const rahul = users.find(u => u.email === 'rahul@taskflow.com');
    const aditya = users.find(u => u.email === 'aditya@taskflow.com');
    const manoj = users.find(u => u.email === 'manoj@taskflow.com');

    console.log(`Rahul ID: ${rahul.id}, Aditya ID: ${aditya.id}, Manoj ID: ${manoj.id}`);

    console.log("3. Arun assigns Aditya to Rahul...");
    res = await request('PUT', `/api/users/${aditya.id}/supervisor`, { supervisorId: rahul.id }, arunToken);
    console.log("Assign Intern response:", res.status, res.data);
    if (res.status !== 200) throw new Error("Failed to assign intern");

    console.log("4. Logging in as Developer Rahul...");
    res = await request('POST', '/auth/login', { email: 'rahul@taskflow.com', password: 'password' });
    if (res.status !== 200) throw new Error("Rahul login failed: " + JSON.stringify(res));
    const rahulToken = res.data.token;

    console.log("5. Rahul fetches assignment suggestions for FRONTEND...");
    res = await request('GET', '/tasks/suggestions/FRONTEND', null, rahulToken);
    const suggestions = res.data;
    console.log("Suggestions length:", suggestions.length);
    const adityaInSuggestions = suggestions.find(u => u.id === aditya.id);
    const manojInSuggestions = suggestions.find(u => u.id === manoj.id);
    
    console.log(`Is Aditya in suggestions? ${!!adityaInSuggestions}`);
    console.log(`Is Manoj in suggestions? ${!!manojInSuggestions}`);

    if (!adityaInSuggestions) throw new Error("Aditya is missing from Rahul's suggestions");
    if (manojInSuggestions) throw new Error("Manoj should NOT be in Rahul's suggestions");

    console.log("6. Rahul creates a task assigned to Aditya...");
    const taskPayload = {
      taskName: 'UI Testing with Intern',
      domain: 'FRONTEND',
      priority: 'MEDIUM',
      completionStatus: 'PENDING',
      startTime: '2026-10-02T10:00:00',
      endTime: '2026-10-05T10:00:00',
      user: { id: rahul.id },
      intern: { id: aditya.id }
    };
    res = await request('POST', '/tasks/save', taskPayload, rahulToken);
    console.log("Task created response:", res.status, res.data);
    if (res.status !== 200) throw new Error("Failed to create task");

    console.log("7. Rahul attempts to create a task for Manoj (Should Fail)...");
    const taskPayloadManoj = { ...taskPayload, intern: { id: manoj.id } };
    res = await request('POST', '/tasks/save', taskPayloadManoj, rahulToken);
    console.log("Task creation response for Manoj:", res.status, res.data);
    if (res.status !== 400 && res.status !== 403 && res.status !== 500) { // Should fail
      throw new Error("Rahul was incorrectly allowed to assign a task to Manoj!");
    } else {
      console.log("Success: Rahul correctly blocked from assigning Manoj.");
    }

    console.log("\nALL TESTS PASSED SUCCESSFULLY.");

  } catch (err) {
    console.error("Test failed:", err);
  }
}

runTest();
