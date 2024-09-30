# Sepolia_claim_API-


Usage :

```
import requests
import json

headers = {
   'Content-Type': 'application/json'
}

url = "https://xxx.us-east-1.amazonaws.com/dev/send-eth"


# you need to change the value of userId and walletAddress
data = {
   "userId": "your_Login_ID",  # Replace with your Login ID
   "walletAddress": "Your_wallet_address"  # Replace with your wallet address
}


# Send a request
res = requests.post(url, data=json.dumps(data), headers=headers)


# Print the status code and the result

if res.status_code == 200:
   print("Done! Check your wallet")
   print(f"Res: {res.json()}")
else:
   print(f"Failed and status Code is: {res.status_code}")
   print(f"Res: {res.text}")


```