import os
import gradio as gr
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def greet(name):
    return f"Hello, {name}!"

# Create Gradio interface
demo = gr.Interface(
    fn=greet,
    inputs=gr.Textbox(label="Name"),
    outputs=gr.Textbox(label="Output"),
    title="Simple Gradio Demo",
    description="Enter your name and click submit to get a greeting!"
)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='Start the Gradio web UI')
    parser.add_argument('--ip', type=str, default='127.0.0.1', help='IP address to bind to')
    parser.add_argument('--port', type=int, default=7788, help='Port to bind to')
    args = parser.parse_args()
    
    # Launch the interface
    demo.launch(server_name=args.ip, server_port=args.port) 