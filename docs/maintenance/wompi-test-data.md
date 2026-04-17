# Wompi Test Data (Sandbox)

To test the payment integration in the development environment, use the following credentials and test cards.

## 1. Credentials

Ensure your `.env` file has the sandbox keys:

- `PUBLIC_WOMPI_PUBLIC_KEY`: `pub_test_...`
- `WOMPI_PRIVATE_KEY`: `prv_test_...`
- `WOMPI_INTEGRITY_SECRET`: `test_integrity_...`
- `WOMPI_EVENT_SECRET`: `test_event_...`

## 2. Test Cards (Luhn Valid)

| Card Type           | Number                | CVV   | Expiry | Result       |
| :------------------ | :-------------------- | :---- | :----- | :----------- |
| **Visa**            | `4242 4242 4242 4242` | `123` | 12/26  | **APPROVED** |
| **Mastercard**      | `5252 5252 5252 5251` | `123` | 12/26  | **APPROVED** |
| **Visa (Declined)** | `4000 0000 0000 0002` | `123` | 12/26  | **DECLINED** |

## 3. Important Notes

- **Luhn Check**: Card numbers must pass the Luhn algorithm. If a number fails, the frontend will block the request before sending it to Wompi.
- **Installments**: Use `1` for simple tests.
- **Email**: Any valid email format works in Sandbox.
