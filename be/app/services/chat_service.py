import os
import dotenv
from openai import AsyncOpenAI

from app.services.image_service import ask_about_image
from app.services.csv_service import ask_about_csv

dotenv.load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY must be set in environment variables.")

client = AsyncOpenAI(api_key=OPENAI_API_KEY)


async def _chat_like_friend(prompt_text: str) -> str:
    system_prompt = (
        "You are a friendly, empathetic chat companion. Speak in a casual, warm tone, as if you were a friend. "
        "Keep responses concise, helpful, and engaging. Ask follow-up questions when appropriate."
    )

    user_text = prompt_text if (prompt_text and prompt_text.strip()) else "Hi!"

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_text},
        ],
    )

    if not response.choices:
        return ""
    content = getattr(response.choices[0].message, "content", None)
    return content or ""


async def process_chat_message(content: str, files: list):
    if not files:
        return await _chat_like_friend(content)

    responses = []

    for f in files:
        file_type = f.get("type", "").lower()
        file_bytes = f.get("bytes")
        mime = f.get("mime", "application/octet-stream")
        filename = f.get("filename", "unknown")
        
        try:
            if file_type == "image":
                resp = await ask_about_image(file_bytes, content, mime_type=mime)
            elif file_type == "csv":
                resp = await ask_about_csv(file_bytes, content)
            else:
                resp = f"Unsupported file type: {file_type}"
        except Exception as e:
            resp = f"Error processing {filename}: {str(e)}"

        responses.append(resp)

    return "\n\n".join(responses)
