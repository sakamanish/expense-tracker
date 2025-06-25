def multiply(a, b):
    return a * b

def divide(a, b):
    return a / b  # No error handling here on purpose


# ❌ TESTS BELOW CONTAIN BUGS
def test_multiply():
    assert multiply(3, 4) == 11  # Wrong expected value (should be 12)

def test_divide():
    assert divide(10, 2) == 6  # Wrong expected value (should be 5)
