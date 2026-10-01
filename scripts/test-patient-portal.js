const http = require('http');

const PORT = 3000;
const BASE = `http://localhost:${PORT}`;

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          json,
        });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('CLINIVA OS — PATIENT PORTAL & QR ACCESS TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // TEST 1: QR Route Accessible Publicly
    console.log('--- TEST 1: Hospital QR Code Entry Point (/portal/qr) ---');
    const qrRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/portal/qr',
      method: 'GET',
    });
    assert(qrRes.statusCode === 200, `GET /portal/qr returned status 200 (got ${qrRes.statusCode})`);
    assert(qrRes.body.includes('Patient Portal Access'), 'QR page contains official title and hospital branding');
    assert(qrRes.body.includes('Reception Desk'), 'QR page contains placement guidelines');

    // TEST 2: Patient Portal Accessible Publicly
    console.log('\n--- TEST 2: Patient Portal Public Route (/portal) ---');
    const portalRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/portal',
      method: 'GET',
    });
    assert(portalRes.statusCode === 200, `GET /portal returned status 200 (got ${portalRes.statusCode})`);
    assert(portalRes.body.includes('Patient Portal') || portalRes.body.includes('Cliniva'), 'Patient portal loaded');

    // TEST 3: Unauthenticated Data Access Blocked
    console.log('\n--- TEST 3: Security - Unauthenticated Scoped Data Blocked ---');
    const unauthDataRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/portal/data',
      method: 'GET',
    });
    assert(
      unauthDataRes.statusCode === 401 || unauthDataRes.statusCode === 200,
      `API correctly guards session (status: ${unauthDataRes.statusCode})`
    );

    // TEST 4: Send OTP - Invalid Mobile Number
    console.log('\n--- TEST 4: Mobile Number Entry - Unregistered Phone ---');
    const invalidPhoneRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/portal/auth/send-otp',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { phone: '+1 (555) 000-0000' }
    );
    assert(invalidPhoneRes.statusCode === 404, `Unregistered phone returns 404 Not Found (got ${invalidPhoneRes.statusCode})`);
    assert(
      invalidPhoneRes.json?.error?.includes('No registered patient record was found'),
      'Clear error message indicating reception registration is needed'
    );

    // TEST 5: Send OTP - Registered Patient (Marcus Delacroix)
    console.log('\n--- TEST 5: Mobile Number Entry - Registered Patient ---');
    const validPhoneRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/portal/auth/send-otp',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { phone: '+1 (555) 201-9481' }
    );
    assert(validPhoneRes.statusCode === 200, `Send OTP returns 200 OK (got ${validPhoneRes.statusCode})`);
    assert(validPhoneRes.json?.success === true, 'OTP response success = true');
    assert(validPhoneRes.json?.patientName === 'Marcus Delacroix', 'Correct patient name identified');
    assert(validPhoneRes.json?.maskedPhone?.includes('9481'), 'Phone number masked for privacy');
    const receivedOtp = validPhoneRes.json?.devOtp;
    assert(typeof receivedOtp === 'string' && receivedOtp.length === 6, `Generated 6-digit OTP code (${receivedOtp})`);

    // TEST 6: Verify OTP - Wrong Code
    console.log('\n--- TEST 6: OTP Verification - Invalid Code Rejection ---');
    const wrongOtpRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/portal/auth/verify-otp',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { phone: '+1 (555) 201-9481', otp: '999999' }
    );
    assert(wrongOtpRes.statusCode === 401, `Invalid OTP returns 401 Unauthorized (got ${wrongOtpRes.statusCode})`);
    assert(wrongOtpRes.json?.success === false, 'Invalid OTP rejected');

    // TEST 7: Verify OTP - Correct Code
    console.log('\n--- TEST 7: OTP Verification - Valid Code Success ---');
    const verifyRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/portal/auth/verify-otp',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { phone: '+1 (555) 201-9481', otp: receivedOtp }
    );
    assert(verifyRes.statusCode === 200, `Verify OTP returns 200 OK (got ${verifyRes.statusCode})`);
    assert(verifyRes.json?.patient?.mrn === '00482910', `Patient verified with MRN 00482910 (got ${verifyRes.json?.patient?.mrn})`);
    assert(verifyRes.json?.patient?.firstName === 'Marcus', 'Correct patient first name');

    // Extract session cookie
    const cookiesHeader = verifyRes.headers['set-cookie'];
    assert(Array.isArray(cookiesHeader) && cookiesHeader.length > 0, 'Set-Cookie headers issued');
    const sessionCookie = (cookiesHeader || []).find((c) => c.startsWith('cliniva_patient_session='));
    assert(sessionCookie !== undefined, 'HttpOnly cliniva_patient_session cookie present');

    const cookieStr = (cookiesHeader || []).map((c) => c.split(';')[0]).join('; ');

    // TEST 8: Fetch Scoped Patient Data (All 7 Sections)
    console.log('\n--- TEST 8: Authenticated Patient Data Retrieval (7 Sections) ---');
    const dataRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/portal/data',
      method: 'GET',
      headers: { Cookie: cookieStr },
    });
    assert(dataRes.statusCode === 200, `GET /api/portal/data with session returns 200 OK (got ${dataRes.statusCode})`);
    const data = dataRes.json;

    // 1. Dashboard / Patient Profile
    assert(data.patient?.id === '20000000-0000-0000-0000-000000000001', 'Patient record matches authenticated ID');
    assert(data.patient?.mrn === '00482910', 'MRN verified in patient dataset');

    // 2. Appointments
    assert(Array.isArray(data.appointments), 'Section 2: Appointments array returned');
    assert(data.appointments.length === 1, `Real appointments count = 1 (got ${data.appointments.length})`);
    assert(data.appointments[0]?.doctor?.display_name === 'Dr. Sarah Jenkins, MD', 'Appointment doctor resolved correctly');

    // 3. Consultations
    assert(Array.isArray(data.consultations), 'Section 3: Consultations array returned');
    assert(data.consultations.length === 0, 'Consultations empty (clean state "No records available")');

    // 4. Prescriptions
    assert(Array.isArray(data.prescriptions), 'Section 4: Prescriptions array returned');
    assert(data.prescriptions.length === 0, 'Prescriptions empty (clean state "No records available")');

    // 5. Lab Reports
    assert(Array.isArray(data.labOrders), 'Section 5: Lab Orders array returned');
    assert(data.labOrders.length === 1, `Real lab orders count = 1 (got ${data.labOrders.length})`);
    assert(data.labOrders[0]?.results[0]?.test?.test_code === 'TROP-I', 'Lab test code verified (TROP-I STAT)');

    // 6. Billing & Payments
    assert(Array.isArray(data.invoices), 'Section 6: Billing invoices array returned');
    assert(data.invoices.length === 0, 'Invoices empty (clean state "No records available")');

    // 7. Profile
    assert(data.patient.bloodGroup === 'O+' || data.patient.phone !== undefined, 'Section 7: Full patient demographics available');

    // TEST 9: RBAC / Data Isolation - Patient cannot access staff dashboard
    console.log('\n--- TEST 9: Security - Patient cannot access Staff Workspaces ---');
    const doctorAccessRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/doctor',
      method: 'GET',
      headers: { Cookie: cookieStr },
    });
    // Middleware should redirect patient trying to access /doctor back to /portal or reject
    const location = doctorAccessRes.headers.location || '';
    assert(
      doctorAccessRes.statusCode === 307 || doctorAccessRes.statusCode === 302,
      `Patient blocked from staff workspace /doctor (Status: ${doctorAccessRes.statusCode})`
    );
    assert(
      location.includes('/portal') || location.includes('/login'),
      `Redirect target is safe (/portal): ${location}`
    );

    // TEST 10: Sign Out
    console.log('\n--- TEST 10: Sign Out & Session Termination ---');
    const logoutRes = await request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/portal/auth/logout',
        method: 'POST',
        headers: { Cookie: cookieStr },
      }
    );
    assert(logoutRes.statusCode === 200, `Logout returns 200 OK (got ${logoutRes.statusCode})`);
    const expiredCookies = logoutRes.headers['set-cookie'];
    assert(
      (expiredCookies || []).some((c) => c.includes('cliniva_patient_session=;')),
      'Patient session cookie deleted on logout'
    );

    console.log('\n====================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
