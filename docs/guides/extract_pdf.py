import os
import sys

def install_and_import(package):
    import importlib
    try:
        importlib.import_module(package)
    except ImportError:
        import subprocess
        print(f"Installing {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
    finally:
        globals()[package] = importlib.import_module(package)

install_and_import('pypdf')

from pypdf import PdfReader

def extract_pdf_to_txt(pdf_path, txt_path):
    print(f"Extracting {pdf_path}...")
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for i, page in enumerate(reader.pages):
            text += f"--- PAGE {i + 1} ---\n"
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"Successfully saved text to {txt_path} ({len(text)} chars)")
    except Exception as e:
        print(f"Error extracting {pdf_path}: {e}")

if __name__ == "__main__":
    guides_dir = os.path.dirname(os.path.abspath(__file__))
    
    pdfs = [
        ("content_Strategy_Template.pdf", "content_Strategy_Template.txt"),
        ("SEO_Strategy_Template_1.pdf", "SEO_Strategy_Template_1.txt"),
        ("SEO_Strategy_Template.pdf", "SEO_Strategy_Template.txt")
    ]
    
    for pdf_name, txt_name in pdfs:
        pdf_path = os.path.join(guides_dir, pdf_name)
        txt_path = os.path.join(guides_dir, txt_name)
        if os.path.exists(pdf_path):
            extract_pdf_to_txt(pdf_path, txt_path)
        else:
            print(f"File not found: {pdf_path}")
