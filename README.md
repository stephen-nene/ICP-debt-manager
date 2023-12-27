---
title: ICP Debt Tracker Documentation
---

# ICP Debt Tracker

Welcome to the documentation for the ICP Debt Tracker, a decentralized application for managing debts on the Internet Computer Protocol (ICP) platform.

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
  - [Get Debts](#get-debts)
  - [Get Debt](#get-debt)
  - [Add Debt](#add-debt)
  - [Update Debt](#update-debt)
  - [Delete Debt](#delete-debt)
- [Contributing](#contributing)

## Introduction

The ICP Debt Tracker is designed to help you manage debts efficiently in a decentralized manner. Whether you are an individual or a business, this application provides a seamless experience for keeping track of debts.

## Getting Started

To get started with the ICP Debt Tracker, follow these steps:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/icp-debt-tracker.git
   cd icp-debt-tracker
   ```
2. **Install Dependencies:**
    ```
    npm install
    ```
3. **Run the Application::**
    ```
    dfx start --background --clean;   
    ```
4. **Deploy the canister**
    ```
    dfx deploy
    ```
# API Reference

## Get Debts
Endpoint: `/getDebts`

Returns a list of all debts.

## Get Debt
Endpoint: `/getDebt/{id}`

Returns details of a specific debt identified by `{id}`.

## Add Debt
Endpoint: `/addDebt`

Adds a new debt entry. Requires a JSON payload with details like debtorName, amount, and description.

## Update Debt
Endpoint: `/updateDebt/{id}`

Updates details of a specific debt identified by `{id}`. Requires a JSON payload with the properties to be updated.

## Delete Debt
Endpoint: `/deleteDebt/{id}`

Deletes a specific debt identified by `{id}`.

# Contributing
Feel free to contribute to the development of ICP Debt Tracker by opening issues or submitting pull requests. Your contributions are welcome and appreciated!
