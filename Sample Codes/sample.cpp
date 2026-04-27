#include <iostream>
#include <vector>
#include <string>

class UserAccount {
private:
    std::string username;
    std::string email;
    int age;
    std::vector<std::string> posts;

public:
    UserAccount(std::string name, std::string mail, int a) : username(name), email(mail), age(a) {}

    void addPost(std::string content) {
        posts.push_back(content);
    }

    void displayInfo() {
        std::cout << "User: " << username << " (" << age << ")" << std::endl;
        std::cout << "Email: " << email << std::endl;
        std::cout << "Total Posts: " << posts.size() << std::endl;
    }

    // Long method to demonstrate detection
    void processUserActivityLogs() {
        std::cout << "Starting log process..." << std::endl;
        std::cout << "Verifying user..." << std::endl;
        std::cout << "Check 1..." << std::endl;
        std::cout << "Check 2..." << std::endl;
        std::cout << "Check 3..." << std::endl;
        std::cout << "Check 4..." << std::endl;
        std::cout << "Check 5..." << std::endl;
        std::cout << "Check 6..." << std::endl;
        std::cout << "Check 7..." << std::endl;
        std::cout << "Check 8..." << std::endl;
        std::cout << "Check 9..." << std::endl;
        std::cout << "Check 10..." << std::endl;
        std::cout << "Check 11..." << std::endl;
        std::cout << "Check 12..." << std::endl;
        std::cout << "Check 13..." << std::endl;
        std::cout << "Check 14..." << std::endl;
        std::cout << "Check 15..." << std::endl;
        std::cout << "Check 16..." << std::endl;
        std::cout << "Check 17..." << std::endl;
        std::cout << "Check 18..." << std::endl;
        std::cout << "Check 19..." << std::endl;
        std::cout << "Check 20..." << std::endl;
        std::cout << "Processing complete." << std::endl;
    }
};

int main() {
    UserAccount user("JohnDoe", "john@example.com", 30);
    user.addPost("Hello World!");
    user.displayInfo();
    user.processUserActivityLogs();
    return 0;
}
