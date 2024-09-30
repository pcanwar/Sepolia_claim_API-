'use strict';
require('dotenv').config(); 
const { JsonRpcProvider, Wallet, parseEther, isAddress } = require('ethers'); 
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const provider = new JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`);
const wallet = new Wallet(process.env.PRIVATE_KEY, provider);

module.exports.sendEth = async (event) => {
  try {
    const { userId, walletAddress } = JSON.parse(event.body);
    const user = await getUserFromDb(userId);
    if (!user) {
      return buildResponse(404, 'User not unauthorized.');
    }
    if (user.claimed) {
      return buildResponse(403, 'You have already claimed coins. If you need more, please email me.');
    }
    if (!isAddress(walletAddress)) {
      return buildResponse(400, 'Invalid wallet address!');
    }
    const gasEstimate = await wallet.estimateGas({
      to: walletAddress,
      value: parseEther("0.15")
    });

    const tx = await wallet.sendTransaction({
      to: walletAddress,
      value: parseEther("0.15"),
      gasLimit: gasEstimate
    });

    await markUserAsClaimed(userId);
    const url = `https://sepolia.etherscan.io/tx/${tx.hash}`;

    return buildResponse(200, { message: 'Transaction sent!', url, transactionHash: tx.hash });
  } catch (error) {
    console.error('Error:', error);
    return buildResponse(500, 'An internal error occurred.');
  }
};

async function getUserFromDb(userId) {
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: { userId }
  };
  const result = await dynamoDb.get(params).promise();
  return result.Item;
}

async function markUserAsClaimed(userId) {
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: { userId },
    UpdateExpression: "set claimed = :claimed",
    ExpressionAttributeValues: { ":claimed": true }
  };
  await dynamoDb.update(params).promise();
}

function buildResponse(statusCode, message) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message)
  };
}
