import styles from './Board.module.css';
import {useGameLoop} from "../../utils/hooks.js";
import {BOARD_SIZE, difficulty} from "../../utils/consts.js";

const Board = () => {
    const {snake, food, status, speed, setSpeed} = useGameLoop();
    const head = snake[snake.length - 1];
    let info;
    if (status === 'over') info = 'Game over';
    else if (status === 'paused') info = 'Paused';
    return (
        <div>
            {info}
            <div className={styles.board} style={{width: `${BOARD_SIZE * 10}px`}}>
                {
                    Array.from({length: BOARD_SIZE}).map((_, i) => i).map(row => (
                        Array.from({length: BOARD_SIZE}).map((_, j) => j)
                            .map(col => {
                                const isSnake = snake.find(cell => cell.x === row && cell.y === col);
                                const isFood = food?.x === row && food?.y === col;
                                const isHead = head.x === row && head.y === col;
                                const cellClasses = [styles.cell];
                                isSnake && cellClasses.push(styles.snake)
                                isFood && cellClasses.push(styles.food)
                                isHead && cellClasses.push(styles.head)
                                return (
                                    <div
                                        key={`${row}-${col}`}
                                        className={cellClasses.join(' ')}
                                    />
                                )
                            })
                    ))
                }
            </div>
            <div className={styles.options}>
                <button
                    className={[styles.easy, speed === difficulty.easy ? styles.active : ''].join(' ')}
                    disabled={speed === difficulty.easy}
                    onClick={() => setSpeed(difficulty.easy)}
                >Easy
                </button>
                <button
                    className={[styles.normal, speed === difficulty.normal ? styles.active : ''].join(' ')}
                    disabled={speed === difficulty.normal}
                    onClick={() => setSpeed(difficulty.normal)}
                >Normal
                </button>
                <button
                    className={[styles.hard, speed === difficulty.hard ? styles.active : ''].join(' ')}
                    disabled={speed === difficulty.hard}
                    onClick={() => setSpeed(difficulty.hard)}
                >Hard
                </button>
            </div>
        </div>
    );
}

export default Board;