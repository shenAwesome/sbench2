import { useState, useEffect } from "react"

function useWatch<T>(fn: () => T, interval: number) {
    const [val, setVal] = useState(fn())
    useEffect(() => {
        const timer = window.setInterval(() => {
            const newValue = fn()
            if (newValue != val) setVal(newValue)
        }, interval)
        return () => window.clearInterval(timer)
    })
}

function sleep(timeout: number) {
    return new Promise<void>(resolve => {
        setTimeout(resolve, timeout)
    })
}

function until(fn: () => boolean) {
    return new Promise<void>(resolve => {
        const check = () => {
            window.setTimeout(() => {
                if (fn()) {
                    resolve()
                } else {
                    check()
                }
            }, 100)
        }
        check()
    })
}

export { useWatch, sleep, until }