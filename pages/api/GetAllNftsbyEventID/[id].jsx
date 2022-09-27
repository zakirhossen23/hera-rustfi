
import React, { useState, useEffect } from 'react';
import usContract from '../../../services/api/useContractApi';

export default async function handler(req, res) {
  const contract = usContract("a9cba477f6702e7b175af9914501919d3a3e5a751f08ac3f9b752e56e78d0988");
  let id = Number(req.query.id)
  let output = null;
  async function fetchContractData() {
    if (contract) {
      const arr = [];
      const totalTokens = await contract.gettokenSearchEventTotal(id);
      for (let i = 0; i < Number(10); i++) {
        const obj = await totalTokens[i];

        let object = {};
        try { object = await JSON.parse(obj) } catch { }
        if (object.title) {
          var pricedes1 = 0;
          try { pricedes1 = formatter.format(Number(object.properties.price.description * 1.10)) } catch (ex) { }
          const TokenId = Number(await contract.gettokenIdByUri(obj));

          console.log(TokenId);
          arr.push({
            Id: TokenId,
            name: object.properties.name.description,
            description: object.properties.description.description,
            Bidprice: pricedes1,
            price: Number(object.properties.price.description),
            type: object.properties.typeimg.description,
            image: object.properties.image.description,
          });
        }

      }

      output = JSON.stringify(arr);
      console.log(arr);
    }
  }

  await fetchContractData();

  res.status(200).json(output)
}