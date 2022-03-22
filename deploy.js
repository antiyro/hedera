require("dotenv").config();
const {
    AccountId,
    PrivateKey,
    Client,
    FileCreateTransaction,
    ContractCreateTransaction,
    ContractFunctionParameters,
    ContractExecuteTransaction,
    ContractCallQuery,
    Hbar,
} = require("@hashgraph/sdk");
const fs = require("fs");

const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

async function main() {
    console.log("Importation du binaire du smart contract dans Hedera...")
    const contractBytecode = fs.readFileSync("helloHedera_sol.bin")
    const fileCreateTx = new FileCreateTransaction()
        .setContents(contractBytecode)
        .setKeys([operatorKey])
        .setMaxTransactionFee(new Hbar(0.75))
        .freezeWith(client);
    const fileCreateSign = await fileCreateTx.sign(operatorKey)
    const fileCreateSubmit = await fileCreateSign.execute(client);
    const fileCreateRx = await fileCreateSubmit.getReceipt(client);
    const byteCodeFileId = fileCreateRx.fileId;
    console.log("Importation succesful")
    console.log(`Bytecode file Id : ${byteCodeFileId} \n`);
    
    // Creation du smart contract
    const contractInstantiateTx = new ContractCreateTransaction()
        .setBytecodeFileId(byteCodeFileId)
        .setGas(100000);
    const contractInstantiateSubmit = await contractInstantiateTx.execute(client);
    const contractInstantiateRx = await contractInstantiateSubmit.getReceipt(client);
    const contractId = contractInstantiateRx.contractId;
    const contractAddress = contractId.toSolidityAddress();
    console.log("Smart contract Id : ", contractId, "\nSmart contract address : ", contractAddress);

    // Appels au smart contract
    const contractQueryTx = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("hello", new ContractFunctionParameters().addString("Hedera"))
        .setMaxQueryPayment(new Hbar(0.00000001))
    const contractQuerySubmit = await contractQueryTx.execute(client);
    console.log("hello world successfull");

}

main()