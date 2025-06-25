def multiply(a, b):
    return a * b

def divide(a, b):
    return a / b


def test_multiply():
    assert multiply(3, 4) == 12  # ✅ Correct: 3 * 4 = 12

def test_divide():
    assert divide(10, 2) == 5  # ✅ Correct: 10 / 2 = 5
