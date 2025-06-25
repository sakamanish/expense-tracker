def print_board(board):
    print("\n")
    for row in board:
        print(" | ".join(row))
        print("-" * 9)
    print("\n")


def check_winner(board, player):
    # Check rows, columns, and diagonals
    for row in board:
        if all(cell == player for cell in row):
            return True

    for col in range(3):
        if all(board[row][col] == player for row in range(3)):
            return True

    if all(board[i][i] == player for i in range(3)):
        return True

    if all(board[i][2 - i] == player for i in range(3)):
        return True

    return False


def is_full(board):
    return all(cell != " " for row in board for cell in row)


def main():
    board = [[" " for _ in range(3)] for _ in range(3)]
    current_player = "X"

    print("Welcome to Tic Tac Toe!")
    print_board(board)

    while True:
        try:
            move = input(f"Player {current_player}, enter your move (row and column: 1 1): ")
            row, col = map(int, move.split())
            row -= 1
            col -= 1

            if not (0 <= row < 3 and 0 <= col < 3):
                print("❌ Invalid position. Use 1 2 format (1 to 3).")
                continue

            if board[row][col] != " ":
                print("❌ That spot is already taken. Try again.")
                continue

            board[row][col] = current_player
            print_board(board)

            if check_winner(board, current_player):
                print(f"🎉 Player {current_player} wins!")
                break

            if is_full(board):
                print("🤝 It's a tie!")
                break

            current_player = "O" if current_player == "X" else "X"

        except ValueError:
            print("⚠️ Invalid input. Please enter row and column like: 1 3")


if __name__ == "__main__":
    main()
