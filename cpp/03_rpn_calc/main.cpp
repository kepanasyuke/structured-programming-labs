#include <algorithm>
#include <cctype>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <stack>
#include <stdexcept>
#include <string>
#include <vector>

namespace {

int precedence(char token) {
    if (token == '+' || token == '-') {
        return 1;
    }
    if (token == '*' || token == '/') {
        return 2;
    }

    return 0;
}

bool is_operator(const std::string& token) {
    return token.size() == 1 && precedence(token.front()) > 0;
}

bool is_number(const std::string& token) {
    if (token.empty()) {
        return false;
    }

    bool seen_digit = false;
    bool seen_separator = false;
    std::size_t start = (token.front() == '-') ? 1 : 0;

    for (std::size_t i = start; i < token.size(); ++i) {
        const char symbol = token[i];
        if (std::isdigit(static_cast<unsigned char>(symbol)) != 0) {
            seen_digit = true;
        } else if ((symbol == '.' || symbol == ',') && !seen_separator) {
            seen_separator = true;
        } else {
            return false;
        }
    }

    return seen_digit;
}

std::vector<std::string> tokenize(const std::string& expression) {
    std::vector<std::string> tokens;
    std::string current;

    for (char symbol : expression) {
        if (std::isspace(static_cast<unsigned char>(symbol)) != 0) {
            if (!current.empty()) {
                tokens.push_back(current);
                current.clear();
            }
            continue;
        }

        const bool is_separator = symbol == '(' || symbol == ')' || symbol == '+' || symbol == '-' || symbol == '*' || symbol == '/';
        if (is_separator) {
            if (!current.empty()) {
                tokens.push_back(current);
                current.clear();
            }
            tokens.emplace_back(1, symbol);
            continue;
        }

        current.push_back(symbol);
    }

    if (!current.empty()) {
        tokens.push_back(current);
    }

    return tokens;
}

void pop_until_bracket(std::stack<std::string>& operators, std::vector<std::string>& output) {
    bool found = false;

    while (!operators.empty() && !found) {
        const std::string top = operators.top();
        operators.pop();
        if (top == "(") {
            found = true;
        } else {
            output.push_back(top);
        }
    }

    if (!found) {
        throw std::runtime_error("несбалансированные скобки");
    }
}

void push_operator(const std::string& token, std::stack<std::string>& operators, std::vector<std::string>& output) {
    bool ready = operators.empty() || operators.top() == "(" || precedence(operators.top().front()) < precedence(token.front());

    while (!ready) {
        output.push_back(operators.top());
        operators.pop();
        ready = operators.empty() || operators.top() == "(" || precedence(operators.top().front()) < precedence(token.front());
    }

    operators.push(token);
}

std::vector<std::string> to_rpn(const std::vector<std::string>& tokens) {
    std::vector<std::string> output;
    std::stack<std::string> operators;

    for (const std::string& token : tokens) {
        if (is_number(token)) {
            output.push_back(token);
        } else if (token == "(") {
            operators.push(token);
        } else if (token == ")") {
            pop_until_bracket(operators, output);
        } else if (is_operator(token)) {
            push_operator(token, operators, output);
        } else {
            throw std::runtime_error("неизвестный токен: " + token);
        }
    }

    while (!operators.empty()) {
        const std::string top = operators.top();
        operators.pop();
        if (top == "(") {
            throw std::runtime_error("несбалансированные скобки");
        }
        output.push_back(top);
    }

    return output;
}

double apply_operator(const std::string& token, double left, double right) {
    if (token == "+") {
        return left + right;
    }
    if (token == "-") {
        return left - right;
    }
    if (token == "*") {
        return left * right;
    }
    if (right == 0.0) {
        throw std::runtime_error("деление на ноль");
    }

    return left / right;
}

double to_number(const std::string& token) {
    std::string normalized = token;
    std::replace(normalized.begin(), normalized.end(), ',', '.');

    return std::stod(normalized);
}

double evaluate_rpn(const std::vector<std::string>& rpn) {
    std::stack<double> values;

    for (const std::string& token : rpn) {
        if (is_number(token)) {
            values.push(to_number(token));
            continue;
        }

        if (values.size() < 2) {
            throw std::runtime_error("недостаточно операндов для оператора " + token);
        }

        const double right = values.top();
        values.pop();
        const double left = values.top();
        values.pop();
        values.push(apply_operator(token, left, right));
    }

    if (values.size() != 1) {
        throw std::runtime_error("выражение разобрано не полностью");
    }

    return values.top();
}

void print_result(const std::string& expression, const std::vector<std::string>& rpn, double value) {
    std::cout << "Выражение: " << expression << '\n';
    std::cout << "ОПЗ:";
    for (const std::string& token : rpn) {
        std::cout << ' ' << token;
    }
    std::cout << "\nРезультат: " << std::setprecision(10) << value << '\n';
}

}  // namespace

int main(int argc, char** argv) {
    const std::string expression = argc > 1 ? argv[1] : "(1240+8940)*2-1500/3";

    try {
        const std::vector<std::string> tokens = tokenize(expression);
        if (tokens.empty()) {
            throw std::runtime_error("пустое выражение");
        }

        const std::vector<std::string> rpn = to_rpn(tokens);
        print_result(expression, rpn, evaluate_rpn(rpn));
    } catch (const std::exception& error) {
        std::cerr << "Ошибка: " << error.what() << '\n';
        return 1;
    }

    return 0;
}
