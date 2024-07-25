# SmartContract for Poly-Vote
## Using Truffle

## Penggunaan
1. Lakukan cloning repositori **Poly-Vote** , pastikan yang diclone branch solidity
2. Jalankan _npm i_.
3. Ganti field env MNEMONIC, APIKEY & POLYGONSCANAPI.
4. Jalankan diterminal > _truffle compile_.
5. Jalankan diterminal > _truffle migrate --network polygon_.
6. Verifikasi SC dengan run > _truffle run verify NamaContract --network polygon_

## Credits

Author: Yanuarso (Twitter: ekoyanu99)

Re deploy smart contract
truffle compile
truffle migrate --network sepolia --reset

truffle run verify polyvote --network sepolia
truffle run verify election --network sepolia