import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const response = await fetch(
    "https://app.mobitechtechnologies.com/sms/sendsms",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        h_api_key:
          "4cf698b78643a1358a245a97f8f261d427fec11d1f71ddf0be5fe7f22a708422",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();

  return NextResponse.json(data);
}
