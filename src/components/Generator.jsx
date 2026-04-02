import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = LOWER.toUpperCase();
const DIGITS = '0123456789';
const SPECIAL = "!@#$%^&*()-_=+[]{};:,.?";

function secureRandInt(max) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return arr[0] % max;
}
function pick(str) { return str.charAt(secureRandInt(str.length)); }
function secureShuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = secureRandInt(i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
function generateFromCounts({ lower, upper, digits, special }) {
    const total = lower + upper + digits + special;
    if (total < 1) return '';
    const chars = [];
    for (let i = 0; i < lower; i++) chars.push(pick(LOWER));
    for (let i = 0; i < upper; i++) chars.push(pick(UPPER));
    for (let i = 0; i < digits; i++) chars.push(pick(DIGITS));
    for (let i = 0; i < special; i++) chars.push(pick(SPECIAL));
    return secureShuffle(chars).join('');
}

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

const evaluateStrength = (password) => {
    let score = 0;

    const length = password.length;

    if (length >= 8) score++;
    if (length >= 12) score++;
    if (length >= 16) score++;

    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (/(.)\1{2,}/.test(password)) score--;
    if (/123|abc|qwerty/i.test(password)) score--;

    score = Math.max(0, score);

    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: '15%' };
    if (score <= 4) return { label: 'Medium', color: 'bg-yellow-500', width: '45%' };
    if (score <= 6) return { label: 'Strong', color: 'bg-blue-500', width: '75%' };
    return { label: 'Very Strong', color: 'bg-green-500', width: '100%' };
};

export default function Generator() {
    const MAX = 25;

    const [lower, setLower] = useState(4);
    const [upper, setUpper] = useState(4);
    const [digits, setDigits] = useState(4);
    const [special, setSpecial] = useState(4);

    const counts = useMemo(() => ({ lower, upper, digits, special }), [lower, upper, digits, special]);
    const totalLength = lower + upper + digits + special;

    const [password, setPassword] = useState(() => generateFromCounts(counts));
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');
    const [strength, setStrength] = useState(() => evaluateStrength(password));

    useEffect(() => {
        if ([lower, upper, digits, special].some(n => n < 0)) {
            setError('Counts must be non-negative');
            return;
        }
        if (totalLength > MAX) {
            setError(`Total length must be ≤ ${MAX}`);
            return;
        }
        if (totalLength === 0) {
            setError('At least one character required');
            setPassword('');
            return;
        }
        setError('');
        const newPw = generateFromCounts(counts);
        setPassword(newPw);
        setStrength(evaluateStrength(newPw));
        setCopied(false);
    }, [lower, upper, digits, special]);

    function setTotalLength(len) {
        len = clamp(Number(len) || 0, 1, MAX);
        const prev = totalLength || 1;
        if (len === prev) return;
        const ratio = len / prev;
        let newLower = Math.max(0, Math.round(lower * ratio));
        let newUpper = Math.max(0, Math.round(upper * ratio));
        let newDigits = Math.max(0, Math.round(digits * ratio));
        let newSpecial = Math.max(0, Math.round(special * ratio));
        let diff = len - (newLower + newUpper + newDigits + newSpecial);
        const order = ['lower', 'upper', 'digits', 'special'];
        while (diff !== 0) {
            for (const key of order) {
                if (diff === 0) break;
                if (diff > 0) {
                    if (key === 'lower') newLower++;
                    if (key === 'upper') newUpper++;
                    if (key === 'digits') newDigits++;
                    if (key === 'special') newSpecial++;
                    diff--;
                } else { // diff < 0
                    if (key === 'special' && newSpecial > 0) { newSpecial--; diff++; continue; }
                    if (key === 'digits' && newDigits > 0) { newDigits--; diff++; continue; }
                    if (key === 'upper' && newUpper > 0) { newUpper--; diff++; continue; }
                    if (key === 'lower' && newLower > 0) { newLower--; diff++; continue; }
                }
            }
            if (Math.abs(diff) > 4) break; // safety
        }
        newLower = clamp(newLower, 0, MAX);
        newUpper = clamp(newUpper, 0, MAX);
        newDigits = clamp(newDigits, 0, MAX);
        newSpecial = clamp(newSpecial, 0, MAX);
        let sum = newLower + newUpper + newDigits + newSpecial;
        if (sum > MAX) {
            // trim from special, digits, upper, lower
            let excess = sum - MAX;
            const trimOrder = ['special', 'digits', 'upper', 'lower'];
            for (const k of trimOrder) {
                if (excess === 0) break;
                if (k === 'special' && newSpecial > 0) {
                    const r = Math.min(newSpecial, excess); newSpecial -= r; excess -= r;
                }
                if (k === 'digits' && excess > 0 && newDigits > 0) {
                    const r = Math.min(newDigits, excess); newDigits -= r; excess -= r;
                }
                if (k === 'upper' && excess > 0 && newUpper > 0) {
                    const r = Math.min(newUpper, excess); newUpper -= r; excess -= r;
                }
                if (k === 'lower' && excess > 0 && newLower > 0) {
                    const r = Math.min(newLower, excess); newLower -= r; excess -= r;
                }
            }
        }
        setLower(newLower);
        setUpper(newUpper);
        setDigits(newDigits);
        setSpecial(newSpecial);
    }

    async function copyPw() {
        try {
            await navigator.clipboard.writeText(password);
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
        } catch (err) {
            console.error('Copy failed', err);
        }
    }
    function regen() { setPassword(generateFromCounts(counts)); setCopied(false); }

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="text-white text-lg font-semibold">Password Generator</div>
                    <div className="text-slate-300 text-sm">⦾ Secure ⦾ Random</div>
                </div>
                <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1.2, repeat: 1, ease: 'easeInOut' }}
                    className="text-2xl"
                >🔐</motion.div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={password}
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ duration: 0.28 }}
                    className="flex items-center justify-between mb-4 px-4 py-3 rounded-lg"
                    style={{
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.01))',
                        border: '1px solid rgba(255,255,255,0.04)'
                    }}
                >
                    <div className="text-sm text-white truncate font-mono-custom w-3/4">{password || '—'}</div>
                    <div className="flex gap-2">
                        <button onClick={copyPw}
                            className="px-3 py-1 rounded-md text-sm text-white bg-gradient-to-r from-accent1 to-accent2">
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                        <button onClick={regen}
                            className="px-3 py-1 rounded-md text-sm text-slate-200 border border-white/6 bg-transparent">
                            Regenerate
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="bg-white/3 p-3 rounded-lg mb-3 grid grid-cols-2 gap-3">
                {[
                    { label: 'Lowercase', value: lower, set: setLower },
                    { label: 'Uppercase', value: upper, set: setUpper },
                    { label: 'Digits', value: digits, set: setDigits },
                    { label: 'Special', value: special, set: setSpecial },
                ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-3 p-2 bg-white/5 rounded-md">
                        <div className="text-sm text-slate-200">{item.label}</div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="0"
                                max={MAX}
                                value={item.value}
                                onChange={(e) => {
                                    const v = clamp(Number(e.target.value || 0), 0, MAX);
                                    const otherTotal = totalLength - item.value;
                                    const newTotal = otherTotal + v;
                                    if (newTotal > MAX) {
                                        const overflow = newTotal - MAX;
                                        let rem = overflow;
                                        if (item.label !== 'Special' && special > 0) {
                                            const take = Math.min(special, rem); setSpecial(s => s - take); rem -= take;
                                        }
                                        if (item.label !== 'Digits' && rem > 0 && digits > 0) {
                                            const take = Math.min(digits, rem); setDigits(s => s - take); rem -= take;
                                        }
                                        if (item.label !== 'Uppercase' && rem > 0 && upper > 0) {
                                            const take = Math.min(upper, rem); setUpper(s => s - take); rem -= take;
                                        }
                                        if (item.label !== 'Lowercase' && rem > 0 && lower > 0) {
                                            const take = Math.min(lower, rem); setLower(s => s - take); rem -= take;
                                        }
                                    }
                                    item.set(v);
                                }}
                                className="w-20 text-right px-2 py-1 rounded-md bg-transparent border border-white/6 text-white"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mb-3">
                <div className="flex items-center justify-between text-sm text-slate-300 mb-2">
                    <div>Total length</div>
                    <div className="text-white font-medium">{totalLength}</div>
                </div>
                <input
                    type="range"
                    min="1"
                    max={MAX}
                    value={totalLength}
                    onChange={(e) => setTotalLength(Number(e.target.value))}
                    className="w-full"
                />
            </div>

            {error && <div className="text-xs text-rose-400 mb-3">{error}</div>}

            <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-slate-300 mb-2">
                    <span>Password strength</span>
                    <span className="text-white">{strength.label}</span>
                </div>

                <div className="w-full h-2 bg-white/10 rounded">
                    <div
                        className={`h-2 rounded ${strength.color} transition-all duration-300`}
                        style={{ width: strength.width }}
                    />
                </div>
            </div>

            <div className="flex gap-3">
                <motion.button onClick={() => { setLower(4); setUpper(4); setDigits(4); setSpecial(4); }}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-accent1 to-accent2">
                    Reset Preset
                </motion.button>

                <motion.button onClick={() => { setLower(Math.max(1, lower)); setUpper(Math.max(0, upper)); setDigits(Math.max(0, digits)); }}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 rounded-lg text-slate-200 border border-white/6 bg-transparent">
                    Ensure Lowercase
                </motion.button>
            </div>
        </>
    );
}