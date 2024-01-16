import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt } from 'azle';
import { v4 as uuidv4, validate as validateUUID } from 'uuid';

type DebtRecord = Record<{
    id: string;
    debtorName: string;
    amount: number;
    description: string;
    createdAt: nat64;
    updatedAt: Opt<nat64>;
}>;

type DebtPayload = Record<{
    debtorName: string;
    amount: number;
    description: string;
}>;

const debtStorage = new StableBTreeMap<string, DebtRecord>(0, 44, 1024);

$query;
export function getDebts(): Result<Vec<DebtRecord>, string> {
    return Result.Ok(debtStorage.values());
}

$query;
export function getTotalDebt(): Result<number, string> {
    const totalDebt = debtStorage.values().reduce((acc, debt) => acc + debt.amount, 0);
    return Result.Ok(totalDebt);
}

$query;
export function searchDebts(query: string): Result<Vec<DebtRecord>, string> {
    if (typeof query !== 'string' || query.trim() === '') {
        return Result.Err<Vec<DebtRecord>, string>('Invalid search query');
    }

    const searchResults = debtStorage.values().filter(
        (debt) =>
            debt.description.toLowerCase().includes(query.toLowerCase()) ||
            debt.debtorName.toLowerCase().includes(query.toLowerCase())
    );
    return Result.Ok(searchResults);
}

$query;
export function getDebt(id: string): Result<DebtRecord, string> {
    if (!id || !validateUUID(id)) {
        return Result.Err<DebtRecord, string>('Invalid ID format');
    }

    return match(debtStorage.get(id), {
        Some: (debt) => Result.Ok<DebtRecord, string>(debt),
        None: () => Result.Err<DebtRecord, string>(`Debt with id=${id} not found`)
    });
}

$update;
export function addDebt(payload: DebtPayload): Result<DebtRecord, string> {
    if (typeof payload.debtorName !== 'string' || payload.debtorName.trim() === '') {
        return Result.Err<DebtRecord, string>('Invalid debtorName');
    }

    if (typeof payload.amount !== 'number' || payload.amount < 0) {
        return Result.Err<DebtRecord, string>('Invalid amount');
    }

    if (typeof payload.description !== 'string' || payload.description.trim() === '') {
        return Result.Err<DebtRecord, string>('Invalid description');
    }

    const debtorName = payload.debtorName;
    const amount = payload.amount;
    const description = payload.description;

    const debt: DebtRecord = {
        id: uuidv4(),
        createdAt: ic.time(),
        updatedAt: Opt.None,
        debtorName,
        amount,
        description,
    };
    
    debtStorage.insert(debt.id, debt);
    return Result.Ok(debt);
}

$update;
export function updateDebt(id: string, payload: DebtPayload): Result<DebtRecord, string> {
    if (!id || !validateUUID(id)) {
        return Result.Err<DebtRecord, string>('Invalid ID format');
    }

    if (typeof payload.debtorName !== 'string' || payload.debtorName.trim() === '') {
        return Result.Err<DebtRecord, string>('Invalid debtorName');
    }

    if (typeof payload.amount !== 'number' || payload.amount < 0) {
        return Result.Err<DebtRecord, string>('Invalid amount');
    }

    if (typeof payload.description !== 'string' || payload.description.trim() === '') {
        return Result.Err<DebtRecord, string>('Invalid description');
    }

    return match(debtStorage.get(id), {
        Some: (debt) => {
            const debtorName = payload.debtorName;
            const amount = payload.amount;
            const description = payload.description;

            const updatedDebt: DebtRecord = {
                ...debt,
                debtorName,
                amount,
                description,
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
    if (!id || !validateUUID(id)) {
        return Result.Err<DebtRecord, string>('Invalid ID format');
    }

    return match(debtStorage.remove(id), {
        Some: (deletedDebt) => Result.Ok<DebtRecord, string>(deletedDebt),
        None: () => Result.Err<DebtRecord, string>(`Debt with id=${id} not found.`)
    });
}

globalThis.crypto = {
    getRandomValues: () => {
        let array = new Uint8Array(32);

        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }

        return array;
    }
};
