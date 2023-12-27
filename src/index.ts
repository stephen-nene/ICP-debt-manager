import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt } from 'azle';
import { v4 as uuidv4 } from 'uuid';

type DebtRecord = Record<{
    id: string;
    debtorName: string;
    amount: number;
    description: string;
    createdAt: nat64;
    updatedAt: Opt<nat64>;
}>

type DebtPayload = Record<{
    debtorName: string;
    amount: number;
    description: string;
}>

const debtStorage = new StableBTreeMap<string, DebtRecord>(0, 44, 1024);

$query;
export function getDebts(): Result<Vec<DebtRecord>, string> {
    return Result.Ok(debtStorage.values());
}

$query;
export function getDebt(id: string): Result<DebtRecord, string> {
    return match(debtStorage.get(id), {
        Some: (debt) => Result.Ok<DebtRecord, string>(debt),
        None: () => Result.Err<DebtRecord, string>(`Debt with id=${id} not found`)
    });
}

$update;
export function addDebt(payload: DebtPayload): Result<DebtRecord, string> {
    const debt: DebtRecord = {
        id: uuidv4(),
        createdAt: ic.time(),
        updatedAt: Opt.None,
        ...payload
    };
    debtStorage.insert(debt.id, debt);
    return Result.Ok(debt);
}

$update;
export function updateDebt(id: string, payload: DebtPayload): Result<DebtRecord, string> {
    return match(debtStorage.get(id), {
        Some: (debt) => {
            const updatedDebt: DebtRecord = {
                ...debt,
                ...payload,
                updatedAt: Opt.Some(ic.time())
            };
            debtStorage.insert(debt.id, updatedDebt);
            return Result.Ok<DebtRecord, string>(updatedDebt);
        },
        None: () => Result.Err<DebtRecord, string>(`Debt with id=${id} not found`)
    });
}

$update;
export function deleteDebt(id: string): Result<DebtRecord, string> {
    return match(debtStorage.remove(id), {
        Some: (deletedDebt) => Result.Ok<DebtRecord, string>(deletedDebt),
        None: () => Result.Err<DebtRecord, string>(`Debt with id=${id} not found.`)
    });
}

// a workaround to make uuid package work with Azle
globalThis.crypto = {
    // @ts-ignore
    getRandomValues: () => {
        let array = new Uint8Array(32);

        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }

        return array;
    }
};
