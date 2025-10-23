import pandas as pd
from openai import AsyncOpenAI
import io, os, dotenv

dotenv.load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY must be set in environment variables.")

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def summarize_csv(file_bytes: bytes) -> str:
    encodings_to_try = ["utf-8", "utf-8-sig", "latin1", "iso-8859-1", "windows-1252"]
    df = None
    for enc in encodings_to_try:
        try:
            df = pd.read_csv(io.BytesIO(file_bytes), encoding=enc)
            break
        except UnicodeDecodeError:
            continue
    if df is None:
        raise ValueError("Unable to decode CSV file with common encodings")

    # Làm sạch & chuẩn hóa
    df = df.dropna(how="all")
    df = df.head(1000)
    for col in df.columns:
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            df[col] = df[col].astype(str)

    numeric_summary = df.describe(include='number').to_dict()  # type: ignore
    categorical_summary = {
        col: df[col].value_counts().head(5).to_dict()
        for col in df.select_dtypes(include='object').columns
    }
    sample_rows = df.head(5).to_dict(orient="records")

    summary_text = (
        f"Dataset Overview:\n"
        f"- Rows: {len(df)}, Columns: {len(df.columns)}\n"
        f"- Columns: {', '.join(df.columns)}\n"
        f"- Missing values per column: {df.isnull().sum().to_dict()}\n\n"
        f"Numeric summary: {numeric_summary}\n\n"
        f"Categorical summary (top 5 values per column): {categorical_summary}\n\n"
        f"Sample rows:\n{sample_rows}"
    )

    return summary_text

async def ask_about_csv(file_bytes: bytes, question: str) -> str:
    if not file_bytes:
        raise ValueError("CSV file is empty")
    summary = summarize_csv(file_bytes)

    response = await client.chat.completions.create(
        model="gpt-4o-mini",  # cùng chuẩn với ask_about_image
        messages=[
            {
                "role": "system",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "You are a professional data analyst. "
                            "You will analyze CSV datasets and answer user questions clearly and accurately."
                        ),
                    }
                ],
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            f"Here is a summary of the CSV dataset:\n\n{summary}\n\n"
                            f"Now, answer this question:\n{question}"
                        ),
                    }
                ],
            },
        ],
    ) #type: ignore

    # Trả về kết quả GPT sinh ra
    return response.choices[0].message.content if response.choices else "" #type: ignore
