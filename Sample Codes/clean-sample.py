# Clean Python code with no code smells
# This should give a quality score of 100

class Calculator:
    """A simple, well-structured calculator class."""
    
    def add(self, a, b):
        """Adds two numbers."""
        return a + b
        
    def subtract(self, a, b):
        """Subtracts two numbers."""
        return a - b
        
    def multiply(self, a, b):
        """Multiplies two numbers."""
        return a * b
        
    def divide(self, a, b):
        """Divides two numbers with error handling."""
        if b == 0:
            raise ValueError("Cannot divide by zero")
        return a / b

def main():
    """Main execution point."""
    calc = Calculator()
    
    x, y = 10, 5
    print(f"{x} + {y} = {calc.add(x, y)}")
    print(f"{x} - {y} = {calc.subtract(x, y)}")
    print(f"{x} * {y} = {calc.multiply(x, y)}")
    print(f"{x} / {y} = {calc.divide(x, y)}")

if __name__ == "__main__":
    main()
