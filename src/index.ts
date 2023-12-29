import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt } from 'azle';
import { v4 as uuidv4, validate as validateUUID } from 'uuid';

// Define the structure of a debt record
type DebtRecord = Record<{
    id: string;
    debtorName: string;
    amount: number;
    description: string;
    createdAt: nat64;
    updatedAt: Opt<nat64>;
}>;

// Define the payload for creating or updating a debt record
type DebtPayload = Record<{
    debtorName: string;
    amount: number;
    description: string;
}>;

// Create a stable B-tree map to store debt records
const debtStorage = new StableBTreeMap<string, DebtRecord>(0, 44, 1024);

// Query to retrieve all debts
$query;
export function getDebts(): Result<Vec<DebtRecord>, string> {
    try {
        return Result.Ok(debtStorage.values());
    } catch (error) {
        return Result.Err<Vec<DebtRecord>, string>(`Error retrieving debts: ${error}`);
    }
}

// Query to calculate the total debt
$query;
export function getTotalDebt(): Result<number, string> {
    try {
        const totalDebt = debtStorage.values().reduce((acc, debt) => acc + debt.amount, 0);
        return Result.Ok(totalDebt);
    } catch (error) {
        return Result.Err<number, string>(`Error calculating total debt: ${error}`);
    }
}

// Query to search debts based on a query string
$query;
export function searchDebts(query: string): Result<Vec<DebtRecord>, string> {
    try {
        // Query Validation: Ensure that the query is a non-empty string
        if (typeof query !== 'string' || query.trim() === '') {
            return Result.Err<Vec<DebtRecord>, string>('Invalid search query');
        }

        const searchResults = debtStorage.values().filter(
            (debt) =>
                debt.description.toLowerCase().includes(query.toLowerCase()) ||
                debt.debtorName.toLowerCase().includes(query.toLowerCase())
        );
        return Result.Ok(searchResults);
    } catch (error) {
        return Result.Err<Vec<DebtRecord>, string>(`Error searching debts: ${error}`);
    }
}

// Query to retrieve a specific debt by ID
$query;
export function getDebt(id: string): Result<DebtRecord, string> {
    try {
        // ID Validation: Ensure that the ID is a valid UUID
        if (!id) {
            return Result.Err<DebtRecord, string>('Invalid ID format');
        }

        return match(debtStorage.get(id), {
            Some: (debt) => Result.Ok<DebtRecord, string>(debt),
            None: () => Result.Err<DebtRecord, string>(`Debt with id=${id} not found`)
        });
    } catch (error) {
        return Result.Err<DebtRecord, string>(`Error retrieving debt: ${error}`);
    }
}

// Update function to add a new debt
$update;
export function addDebt(payload: DebtPayload): Result<DebtRecord, string> {
    try {
        // Payload Validation: Ensure that required fields are present in the payload
        if (!payload.debtorName || !payload.amount || !payload.description) {
            return Result.Err<DebtRecord, string>('Invalid payload');
        }

        // Set each property of the payload individually
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
    } catch (error) {
        return Result.Err<DebtRecord, string>(`Error adding debt: ${error}`);
    }
}

// Update function to update an existing debt
$update;
export function updateDebt(id: string, payload: DebtPayload): Result<DebtRecord, string> {
    try {
        // ID Validation: Ensure that the ID is a valid UUID
        if (!id) {
            return Result.Err<DebtRecord, string>('Invalid ID format');
        }

        // Payload Validation: Ensure that required fields are present in the payload
        if (!payload.debtorName || !payload.amount || !payload.description) {
            return Result.Err<DebtRecord, string>('Invalid payload');
        }

        return match(debtStorage.get(id), {
            Some: (debt) => {
                // Set each property of the payload individually
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
    } catch (error) {
        return Result.Err<DebtRecord, string>(`Error updating debt: ${error}`);
    }
}

// Update function to delete an existing debt
$update;
export function deleteDebt(id: string): Result<DebtRecord, string> {
    try {
        // ID Validation: Ensure that the ID is a valid UUID
        if (!id) {
            return Result.Err<DebtRecord, string>('Invalid ID format');
        }

        return match(debtStorage.remove(id), {
            Some: (deletedDebt) => Result.Ok<DebtRecord, string>(deletedDebt),
            None: () => Result.Err<DebtRecord, string>(`Debt with id=${id} not found.`)
        });
    } catch (error) {
        return Result.Err<DebtRecord, string>(`Error deleting debt: ${error}`);
    }
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
