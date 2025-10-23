import base64
import os
from openai import AsyncOpenAI
import dotenv

dotenv.load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY must be set in environment variables.")

client = AsyncOpenAI(api_key=OPENAI_API_KEY)

async def ask_about_image(image_bytes: bytes, question: str, mime_type: str = "image/jpeg") -> str:
    if not image_bytes:
        raise ValueError("Image bytes are empty")

    base64_image = base64.b64encode(image_bytes).decode("utf-8")

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": question,
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mime_type};base64,{base64_image}"
                        },
                    },
                ],
            },
        ],
    )

    return response.choices[0].message.content if response.choices else "" #type: ignore
