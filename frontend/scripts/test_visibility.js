const http = require('http');

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 9005,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    if (token) options.headers['Authorization'] = 'Bearer ' + token;

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

async function runTest() {
  try {
    console.log("1. Logging in as Team Lead Arun...");
    let res = await request('POST', '/auth/login', { email: 'arun@test.com', password: 'Arun@123' });
    if (res.status !== 200) throw new Error("Arun login failed: " + JSON.stringify(res));
    const arunToken = res.data.token;
    
    console.log("2. Fetching developers to find Rahul's ID...");
    res = await request('GET', '/tasks/suggestions/MOBILE', null, arunToken);
    const rahul = res.data.find(u => (u.name && u.name.includes('Rahul')) || (u.userName && u.userName.includes('Rahul')) || (u.email && u.email.includes('rahul')));
    if (!rahul) throw new Error("Rahul not found in suggestions");
    
    console.log("3. Creating a task assigned to Rahul...");
    res = await request('POST', '/tasks/save', {
      taskName: "Mobile UI Tags mismatch",
      domain: "MOBILE",
      priority: "HIGH",
      completionStatus: "PENDING",
      startTime: "2026-10-02T10:00:00",
      endTime: "2026-10-05T10:00:00",
      user: { id: rahul.id }
    }, arunToken);
    const createdTask = res.data;
    console.log("Task created response:", createdTask);
    const taskId = createdTask && typeof createdTask === 'object' ? createdTask.id : null;
    
    console.log("4. Verifying task appears in Arun's list...");
    res = await request('GET', '/tasks/GetallData', null, arunToken);
    
    const arunSees = res.data.find(t => t.id === taskId);
    if (!arunSees) {
      console.log("Tasks found:", res.data.length);
      throw new Error("Arun DOES NOT see the assigned task " + taskId);
    }
    console.log("Success: Arun sees the task assigned to Rahul. ID:", arunSees.id);
    const finalTaskId = arunSees.id;
    
    const emailToUse = createdTask.user.email;
    console.log("5. Logging in as Developer Rahul using email:", emailToUse);
    res = await request('POST', '/auth/login', { email: emailToUse, password: 'password' });
    if (res.status !== 200) throw new Error("Rahul login failed: " + JSON.stringify(res));
    const rahulToken = res.data.token;
    
    console.log("6. Verifying task appears in Rahul's list...");
    res = await request('GET', '/tasks/GetallData', null, rahulToken);
    if (!Array.isArray(res.data)) {
      console.log("Rahul's GetallData response:", res.data);
      throw new Error("Rahul GetallData did not return an array");
    }
    const rahulSees = res.data.find(t => t.id === finalTaskId);
    if (!rahulSees) {
      console.log("Rahul sees these tasks:", JSON.stringify(res.data, null, 2));
      throw new Error("Rahul DOES NOT see his assigned task!");
    }
    console.log("Success: Rahul sees his assigned task.");
    
    console.log("7. Rahul updates task status to IN_PROGRESS...");
    res = await request('PUT', `/tasks/update/${finalTaskId}`, {
      completionStatus: "IN_PROGRESS"
    }, rahulToken);
    if (res.status !== 200) throw new Error("Rahul update failed: " + JSON.stringify(res));
    
    console.log("8. Verifying status change...");
    res = await request('GET', '/tasks/GetallData', null, rahulToken);
    const updated = res.data.find(t => t.id === finalTaskId);
    console.log("Updated status is:", updated.completionStatus);
    
    console.log("TEST COMPLETED SUCCESSFULLY");
  } catch(e) {
    console.error(e);
  }
}
runTest();
