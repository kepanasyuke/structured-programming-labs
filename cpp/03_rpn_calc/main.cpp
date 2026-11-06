#include <algorithm>
#include <cctype>
#include <iomanip>
#include <iostream>
#include <optional>
#include <sstream>
#include <stack>
#include <string>
#include <vector>

namespace {

constexpr char kDefaultExpression[] = "(1240+8940)*2-1500/3";

int precedence(char token) {
    const bool additive = token == '+' || token == '-';
    const bool multiplicative = token == '*' || token == '/';

    return additive ? 1 : multiplicative ? 2 : 0;
}

bool is_operator(const std::string& token) {
    return token.size() == 1 && precedence(token.front()) > 0;
}

bool is_digit_symbol(char symbol) {
    return std::isdigit(static_cast<unsigned char>(symbol)) != 0;
}

bool is_separator_symbol(char symbol) {
    return symbol == '.' || symbol == ',';
}

bool is_operator_symbol(char symbol) {
    return symbol == '+' || symbol == '-' || symbol == '*' || symbol == '/';
}

bool is_space_symbol(char symbol) {
    return std::isspace(static_cast<unsigned char>(symbol)) != 0;
}

bool is_bracket_symbol(char symbol) {
    return symbol == '(' || symbol == ')';
}

bool is_token_separator(char symbol) {
    return is_space_symbol(symbol) || is_bracket_symbol(symbol) || is_operator_symbol(symbol);
}

struct Scan {
    bool seen_digit = false;
    bool seen_separator = false;
    bool valid = true;
};

void mark_digit(Scan& scan) {
    scan.seen_digit = true;
}

void mark_separator(Scan& scan) {
    scan.seen_separator = true;
}

void mark_invalid(Scan& scan) {
    scan.valid = false;
}

void inspect_symbol(char symbol, Scan& scan) {
    if (is_digit_symbol(symbol)) {
        mark_digit(scan);
    } else if (is_separator_symbol(symbol) && !scan.seen_separator) {
        mark_separator(scan);
    } else {
        mark_invalid(scan);
    }
}

void scan_symbol(const std::string& token, std::size_t index, Scan& scan) {
    if (index < token.size()) {
        inspect_symbol(token[index], scan);
    }
}

Scan scan_number(const std::string& token, std::size_t index, Scan scan) {
    for (; index < token.size(); index += 1) {
        scan_symbol(token, index, scan);
    }

    return scan;
}

std::size_t signed_start(const std::string& token) {
    const bool has_sign = !token.empty() && token.front() == '-';

    return has_sign ? 1 : 0;
}

bool is_number(const std::string& token) {
    const std::size_t start = signed_start(token);
    const Scan scan = scan_number(token, start, Scan());

    return !token.empty() && scan.seen_digit && scan.valid;
}

void close_token(std::vector<std::string>& tokens, std::string& current) {
    if (!current.empty()) {
        tokens.push_back(current);
        current.clear();
    }
}

void push_symbol(char symbol, std::vector<std::string>& tokens) {
    tokens.emplace_back(1, symbol);
}

void feed_separator(char symbol, std::vector<std::string>& tokens, std::string& current) {
    close_token(tokens, current);
    push_symbol(symbol, tokens);
}

void tokenize_symbol(char symbol, std::vector<std::string>& tokens, std::string& current) {
    if (is_token_separator(symbol)) {
        feed_separator(symbol, tokens, current);
    } else {
        current.push_back(symbol);
    }
}

void tokenize_range(const std::string& expression, std::size_t index, std::vector<std::string>& tokens,
                    std::string& current) {
    for (; index < expression.size(); index += 1) {
        tokenize_symbol(expression[index], tokens, current);
    }
}

std::vector<std::string> tokenize(const std::string& expression) {
    std::vector<std::string> tokens;
    std::string current;
    tokenize_range(expression, 0, tokens, current);
    close_token(tokens, current);

    return tokens;
}

void pop_top(std::stack<std::string>& operators, std::vector<std::string>& output, bool& found) {
    const std::string top = operators.top();
    operators.pop();
    found = top == "(";
    if (!found) {
        output.push_back(top);
    }
}

bool pop_until_bracket(std::stack<std::string>& operators, std::vector<std::string>& output) {
    bool found = false;

    while (!operators.empty() && !found) {
        pop_top(operators, output, found);
    }

    return found;
}

bool should_pop(const std::stack<std::string>& operators, const std::string& token) {
    const bool empty = operators.empty();
    const bool bracket = !empty && operators.top() == "(";
    const bool higher = !empty && !bracket && precedence(operators.top().front()) >= precedence(token.front());

    return higher;
}

void push_operator(const std::string& token, std::stack<std::string>& operators, std::vector<std::string>& output) {
    for (; should_pop(operators, token); operators.pop()) {
        output.push_back(operators.top());
    }
    operators.push(token);
}

struct Conversion {
    bool ok = true;
    std::string error;
    std::vector<std::string> output;
};

Conversion fail_rpn(const std::string& message, Conversion state) {
    state.ok = false;
    state.error = message;

    return state;
}

Conversion emit_number(const std::string& token, Conversion state) {
    if (is_number(token)) {
        state.output.push_back(token);
    }

    return state;
}

Conversion emit_close(std::stack<std::string>& operators, Conversion state) {
    const bool found = pop_until_bracket(operators, state.output);

    return found ? state : fail_rpn("несбалансированные скобки", state);
}

Conversion emit_open(const std::string& token, std::stack<std::string>& operators, Conversion state) {
    operators.push(token);

    return state;
}

Conversion emit_operator(const std::string& token, std::stack<std::string>& operators, Conversion state) {
    push_operator(token, operators, state.output);

    return state;
}

bool is_known_token(const std::string& token) {
    return token == "(" || token == ")" || is_operator(token) || is_number(token);
}

Conversion convert_token(const std::string& token, std::stack<std::string>& operators, Conversion state) {
    const bool number = is_number(token);
    const bool open = !number && token == "(";
    const bool close = !number && !open && token == ")";

    return is_known_token(token) ? route_token(token, number, open, close, operators, state)
                                 : fail_rpn("неизвестный токен: " + token, state);
}

Conversion route_operator(const std::string& token, bool open, bool close, std::stack<std::string>& operators,
                          Conversion state) {
    return open ? emit_open(token, operators, state) : close ? emit_close(operators, state) : emit_operator(token, operators, state);
}

Conversion route_token(const std::string& token, bool number, bool open, bool close, std::stack<std::string>& operators,
                       Conversion state) {
    return number ? emit_number(token, state) : route_operator(token, open, close, operators, state);
}

Conversion drain_step(std::stack<std::string>& operators, Conversion state) {
    const std::string top = operators.top();
    const bool bracket = top == "(";
    operators.pop();
    if (!bracket) {
        state.output.push_back(top);
    }

    return bracket ? fail_rpn("несбалансированные скобки", state) : state;
}

Conversion drain_operators(std::stack<std::string>& operators, Conversion state) {
    for (; !operators.empty() && state.ok; drain_step(operators, state)) {
    }

    return state;
}

Conversion convert_all(const std::vector<std::string>& tokens, std::size_t index, std::stack<std::string>& operators,
                       Conversion state) {
    for (; index < tokens.size(); index += 1) {
        state = convert_token(tokens[index], operators, state);
    }

    return drain_operators(operators, state);
}

Conversion to_rpn_checked(const std::vector<std::string>& tokens) {
    std::stack<std::string> operators;

    return convert_all(tokens, 0, operators, Conversion());
}

double add(double left, double right) {
    return left + right;
}

double subtract(double left, double right) {
    return left - right;
}

double multiply(double left, double right) {
    return left * right;
}

double divide(double left, double right) {
    return right == 0.0 ? 0.0 : left / right;
}

bool is_plus(const std::string& token) {
    return token == "+";
}

bool is_minus(const std::string& token) {
    return token == "-";
}

bool is_times(const std::string& token) {
    return token == "*";
}

bool is_slash(const std::string& token) {
    return token == "/";
}

double compute_operator(const std::string& token, double left, double right) {
    return is_plus(token) ? add(left, right)
           : is_minus(token) ? subtract(left, right)
           : is_times(token) ? multiply(left, right)
                             : divide(left, right);
}

struct Operation {
    bool ok = true;
    std::string error;
    double value = 0.0;
};

Operation apply_operator(const std::string& token, double left, double right) {
    Operation operation;
    operation.ok = !is_slash(token) || right != 0.0;
    operation.value = compute_operator(token, left, right);
    operation.error = operation.ok ? std::string() : "деление на ноль";

    return operation;
}

double to_number(const std::string& token) {
    std::string normalized = token;
    std::replace(normalized.begin(), normalized.end(), ',', '.');
    std::istringstream stream(normalized);
    double number = 0.0;
    stream >> number;

    return number;
}

struct Evaluator {
    bool ok = true;
    std::string error;
    std::stack<double> values;
};

void pop_operands(Evaluator& evaluator, double& left, double& right) {
    right = evaluator.values.top();
    evaluator.values.pop();
    left = evaluator.values.top();
    evaluator.values.pop();
}

void apply_step(Evaluator& evaluator, const std::string& token, double left, double right) {
    const Operation operation = apply_operator(token, left, right);
    evaluator.ok = operation.ok;
    evaluator.error = operation.error;
    if (operation.ok) {
        evaluator.values.push(operation.value);
    }
}

Evaluator missing_operands(const std::string& token, Evaluator evaluator) {
    evaluator.ok = false;
    evaluator.error = "недостаточно операндов для оператора " + token;

    return evaluator;
}

void apply_operands(Evaluator& evaluator, const std::string& token) {
    double left = 0.0;
    double right = 0.0;
    pop_operands(evaluator, left, right);
    apply_step(evaluator, token, left, right);
}

Evaluator eval_operator(Evaluator evaluator, const std::string& token) {
    const bool enough = evaluator.values.size() >= 2;

    if (enough) {
        apply_operands(evaluator, token);
    }

    return enough ? evaluator : missing_operands(token, evaluator);
}

Evaluator eval_token(Evaluator evaluator, const std::string& token) {
    if (is_number(token)) {
        evaluator.values.push(to_number(token));
    } else {
        evaluator = eval_operator(evaluator, token);
    }

    return evaluator;
}

Evaluator eval_all(const std::vector<std::string>& rpn, std::size_t index, Evaluator evaluator) {
    for (; index < rpn.size() && evaluator.ok; index += 1) {
        evaluator = eval_token(evaluator, rpn[index]);
    }

    return evaluator;
}

double final_value(const Evaluator& evaluator) {
    return evaluator.values.size() == 1 ? evaluator.values.top() : 0.0;
}

std::string final_error(const Evaluator& evaluator) {
    const bool complete = evaluator.values.size() == 1;
    const bool silent = evaluator.ok;

    return silent ? (complete ? std::string() : std::string("выражение разобрано не полностью")) : evaluator.error;
}

std::optional<double> evaluate_rpn(const std::vector<std::string>& rpn) {
    const Evaluator evaluator = eval_all(rpn, 0, Evaluator());

    return final_error(evaluator).empty() ? std::optional<double>(final_value(evaluator)) : std::nullopt;
}

void print_value(double value) {
    std::cout << "\nРезультат: " << std::setprecision(10) << value << '\n';
}

std::string expression_of(int argc, char** argv) {
    return argc > 1 ? std::string(argv[1]) : std::string(kDefaultExpression);
}

std::string check_expression(const std::vector<std::string>& tokens) {
    const bool empty = tokens.empty();
    const Conversion state = to_rpn_checked(tokens);

    return empty ? std::string("пустое выражение") : state.error;
}

void report_error(const std::string& message) {
    std::cerr << "Ошибка: " << message << '\n';
}

struct Outcome {
    std::string message;
    std::optional<double> value;
    std::vector<std::string> rpn;
};

std::string missing_value_message() {
    return "выражение разобрано не полностью";
}

bool is_success(const Outcome& outcome) {
    return outcome.message.empty() && outcome.value;
}

std::string describe(const Outcome& outcome) {
    return outcome.message.empty() ? (outcome.value ? std::string() : missing_value_message()) : outcome.message;
}

int status_of(const Outcome& outcome) {
    return is_success(outcome) ? 0 : 1;
}

void report(const Outcome& outcome) {
    const std::string text = describe(outcome);

    if (!text.empty()) {
        report_error(text);
    }
}

Outcome evaluate(const std::vector<std::string>& tokens) {
    const Conversion state = to_rpn_checked(tokens);
    Outcome outcome;
    outcome.message = check_expression(tokens);
    outcome.value = outcome.message.empty() ? evaluate_rpn(state.output) : std::nullopt;
    outcome.rpn = state.output;

    return outcome;
}

void print_expression(const std::string& expression) {
    std::cout << "Выражение: " << expression << '\n';
}

void print_rpn_token(const std::string& token) {
    std::cout << ' ' << token;
}

void print_rpn_all(const std::vector<std::string>& rpn) {
    for (std::size_t index = 0; index < rpn.size(); index += 1) {
        print_rpn_token(rpn[index]);
    }
}

void print_rpn(const std::vector<std::string>& rpn) {
    std::cout << "ОПЗ:";
    print_rpn_all(rpn);
}

void print_success(const std::string& expression, const Outcome& outcome) {
    print_expression(expression);
    print_rpn(outcome.rpn);
    print_value(*outcome.value);
}

void print_outcome(const std::string& expression, const Outcome& outcome) {
    if (is_success(outcome)) {
        print_success(expression, outcome);
    }
}

int compute(const std::string& expression) {
    const Outcome outcome = evaluate(tokenize(expression));

    print_outcome(expression, outcome);
    report(outcome);

    return status_of(outcome);
}

}  // namespace

int main(int argc, char** argv) {
    return compute(expression_of(argc, argv));
}
