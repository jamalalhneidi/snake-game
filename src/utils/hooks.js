import {useEffect, useRef, useState} from "react";
import {BOARD_SIZE, difficulty} from "./consts.js";
import {randomInt} from "./math.js";

export const useInterval = (callback, delay) => {
    const savedCallback = useRef();
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }

        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

export const useMovement = (initial, pause) => {
    const [direction, setDirection] = useState(initial);
    useEffect(() => {
        const handleKeydown = (e) => {
            if (e.key === 'ArrowLeft' && direction !== 'right')
                setDirection('left');
            else if (e.key === 'ArrowRight' && direction !== 'left')
                setDirection('right');
            else if (e.key === 'ArrowUp' && direction !== 'down')
                setDirection('up');
            else if (e.key === 'ArrowDown' && direction !== 'up')
                setDirection('down');
            else if (e.key === 'Escape')
                pause()
        }
        window.addEventListener('keydown', handleKeydown);
        return () => {
            window.removeEventListener('keydown', handleKeydown);
        }
    }, [direction]);
    return direction;
}

export const useGameLoop = () => {
    const [speed, setSpeed] = useState(difficulty.easy);
    const speedRef = useRef(speed);
    const [snake, setSnake] = useState([{x: 0, y: 0}]);
    const [food, setFood] = useState({x: 1, y: 1});
    const [status, setStatus] = useState('running');
    const pause = () => {
        setStatus(prev => {
            if (prev === 'running') return 'paused';
            if (prev === 'over') {
                setSnake([{x: 0, y: 0}]);
                setFood({x: 1, y: 1});
            }
            return 'running';
        })
    }
    const direction = useMovement('right', pause);

    useEffect(() => {
        if (!speed) return;
        speedRef.current = speed;
    }, [speed])

    useEffect(() => {
        if (status === 'running') setSpeed(speedRef.current);
        else setSpeed(null);
    }, [status])

    const handleFood = ({x, y}) => {
        if (food.x !== x || food.y !== y) return false;
        const rows = Array.from({length: BOARD_SIZE}).map((_, i) => i)
        const cols = Array.from({length: BOARD_SIZE}).map((_, i) => i)
        const cells = rows.map(row => cols.map(col => ({x: row, y: col}))).flat();
        const availableCells = cells.filter(cell => (cell.x !== food.x || cell.y !== food.y) && !snake.find(sCell => cell.x === sCell.x && cell.y === sCell.y));
        if (!availableCells.length) setStatus('over');
        else setFood(availableCells[randomInt(availableCells.length)]);
        return true;
    };
    const handleMove = ({x, y}) => {
        let res = {x, y};
        if (x === BOARD_SIZE) res = ({x: 0, y});
        else if (x === -1) res = ({x: BOARD_SIZE - 1, y});
        else if (y === BOARD_SIZE) res = ({x, y: 0});
        else if (y === -1) res = ({x, y: BOARD_SIZE - 1});
        return res;
    }
    const checkSelfCollision = (snake, moveTo) => {
        return !!snake.find(cell => cell.x === moveTo.x && cell.y === moveTo.y);
    }
    const moveSnake = ({x, y}) => {
        const moveTo = handleMove({x, y});
        const grow = handleFood(moveTo);
        setSnake(prev => {
            const newSnake = [...prev];
            !grow && newSnake.shift();
            const didSelfCollide = checkSelfCollision(newSnake, moveTo);
            if (didSelfCollide) {
                setStatus('over');
                return prev;
            }
            newSnake.push(moveTo);
            return newSnake;
        });
    }
    useInterval(() => {
        const head = snake[snake.length - 1];
        if (direction === 'right')
            moveSnake({x: head.x, y: head.y + 1})
        else if (direction === 'left')
            moveSnake({x: head.x, y: head.y - 1})
        else if (direction === 'up')
            moveSnake({x: head.x - 1, y: head.y})
        else if (direction === 'down')
            moveSnake({x: head.x + 1, y: head.y})
    }, speed);
    return {snake, food, status, speed, setSpeed};
}
