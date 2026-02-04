import sys
from pathlib import Path

# Add backend directory to Python path so tests can import app module
sys.path.insert(0, str(Path(__file__).parent.parent))
