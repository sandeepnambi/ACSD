# Python code with minor code smells
# This should give a quality score slightly less than 100 (e.g., 95 or 90)

class DataProcessor:
    def __init__(self, config):
        self.config = config

    # Minor Smell: Excess parameters (6 parameters, threshold is 5)
    def process_user_data(self, name, age, email, address, phone, occupation):
        user = {
            "name": name,
            "age": age,
            "email": email,
            "address": address,
            "phone": phone,
            "occupation": occupation
        }
        return user

    def simple_method(self, x):
        return x * 2

def run_test():
    processor = DataProcessor({"mode": "test"})
    # Correctly calling the method with many parameters
    result = processor.process_user_data(
        "John Doe", 30, "john@example.com", 
        "123 Main St", "555-0199", "Engineer"
    )
    print(result)

if __name__ == "__main__":
    run_test()
