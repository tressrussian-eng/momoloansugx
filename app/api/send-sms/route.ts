export async function POST(request) {
  try {
    const { to, message } = await request.json();

    const body = new URLSearchParams({
      username: 'Setitb',
      to,
      message,
    });

    const response = await fetch(
      "https://api.africastalking.com/version1/messaging",
      {
        method: "POST",
        headers: {
          apiKey: 'atsk_c4dcc32be868fbc37318340da5a92234fb731d897016ac7652ce1cd26e705d25e76511dd',
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body,
      }
    );

    const data = await response.json();

    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
