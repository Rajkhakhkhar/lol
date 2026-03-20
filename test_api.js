const http = require('http');

const tests = [
  { city: 'Mumbai', country: 'India', interests: ['Luxury'] },
  { city: 'Mumbai', country: 'India', interests: ['Nature'] },
  { city: 'Mumbai', country: 'India', interests: ['Food'] },
  { city: 'Mumbai', country: 'India', interests: ['Nightlife'] },
  { city: 'Mumbai', country: 'India', interests: ['Luxury', 'Culture'] },
];

async function runTest(test) {
  return new Promise((resolve) => {
    const data = JSON.stringify(test);
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/ai-place-suggestions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ test, response: JSON.parse(body) });
        } catch (e) {
          resolve({ test, error: body });
        }
      });
    });

    req.on('error', (e) => resolve({ test, error: e.message }));
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('--- STARTING INTEREST-BASED SUGGESTION TESTS ---');
  for (const test of tests) {
    console.log(`\nTEST: City=${test.city}, Interests=[${test.interests.join(', ')}]`);
    const result = await runTest(test);
    if (result.response && result.response.places) {
      console.log(`SUCCESS: Found ${result.response.places.length} places (Fallback: ${result.response.isFallback || false})`);
      result.response.places.forEach((p, i) => {
        console.log(`${i+1}. ${p.placeName} (${p.category}) - ${p.shortDescription.substring(0, 60)}...`);
      });
    } else {
      console.log(`FAILURE:`, result.error || result.response);
    }
  }
}

main();
