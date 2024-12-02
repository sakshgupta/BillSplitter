import React, { useState, useRef, useEffect } from "react";
import "tailwindcss/tailwind.css";
import logo from "/favicon.png";

export default function BillSplitter() {
  const [peopleCount, setPeopleCount] = useState(2);
  const [names, setNames] = useState(["Person 1", "Person 2"]);
  const [items, setItems] = useState([{ name: "", price: 0, belongsTo: [] }]);
  const [discounts, setDiscounts] = useState([0]);
  const [extraCharges, setExtraCharges] = useState([0]);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [totalItemsPrice, setTotalItemsPrice] = useState(0);
  const [billResult, setBillResult] = useState(null);

  const priceRefs = useRef([]);

  const addItem = () => {
    setItems([...items, { name: "", price: 0, belongsTo: [] }]);
    priceRefs.current = [...priceRefs.current, null];
  };

  const updateItem = (index, key, value) => {
    const updatedItems = [...items];
    updatedItems[index][key] = value;
    setItems(updatedItems);
  };

  useEffect(() => {
    // Recalculate total item prices whenever items change
    const total = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
    setTotalItemsPrice(total);
  }, [items]);

  const updatePeople = (count) => {
    setPeopleCount(count);
    const updatedNames = Array.from(
      { length: count },
      (_, i) => `Person ${i + 1}`
    );
    setNames(updatedNames);
  };

  const addDiscount = () => {
    setDiscounts([...discounts, 0]);
  };

  const updateDiscount = (index, value) => {
    const updatedDiscounts = [...discounts];
    updatedDiscounts[index] = value;
    setDiscounts(updatedDiscounts);
  };

  const addExtraCharge = () => {
    setExtraCharges([...extraCharges, 0]);
  };

  const updateExtraCharge = (index, value) => {
    const updatedExtraCharges = [...extraCharges];
    updatedExtraCharges[index] = value;
    setExtraCharges(updatedExtraCharges);
  };

  const calculateBill = () => {
    // Calculate bill splits before extra charges, taxes, and discounts
    let personTotals = new Array(peopleCount).fill(0);
    items.forEach((item) => {
      const splitValue = item.price / item.belongsTo.length;
      item.belongsTo.forEach((person) => {
        personTotals[person] += splitValue;
      });
    });

    const baseTotals = [...personTotals];

    // Add extra charges
    const totalBillBeforeExtras = personTotals.reduce((a, b) => a + b, 0);

    extraCharges.forEach((charge) => {
      const ratio = charge / totalBillBeforeExtras;
      personTotals = personTotals.map((total) => total + total * ratio);
    });

    // Apply discounts
    discounts.forEach((discount) => {
      const ratio = discount / totalBillBeforeExtras;
      personTotals = personTotals.map((total) => total - total * ratio);
    });

    // Apply taxes
    const taxMultiplier = 1 + taxPercentage / 100;
    personTotals = personTotals.map((total) => total * taxMultiplier);

    return { baseTotals, personTotals };
  };

  const handleSubmit = () => {
    const result = calculateBill();
    setBillResult(result);
  };

  const handleNameKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      priceRefs.current[index]?.focus();
    }
  };

  const handlePriceKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem(); // Add a new item

      // Delay focus to ensure the new item is rendered before focusing
      setTimeout(() => {
        const nextIndex = index + 1;
        priceRefs.current[nextIndex]?.focus();
      }, 0);
    }
  };

  const copyTable = () => {
    if (!billResult) return;

    const header = `| Items \\ Persons | ${names.join(" | ")} |`;
    const separator = `|${"-".repeat(header.length - 2)}|`;
    const rows = items.map(
      (item, index) =>
        `| ${item.name || `Item ${index + 1}`} | ${names
          .map((_, i) =>
            item.belongsTo.includes(i)
              ? (item.price / item.belongsTo.length).toFixed(2)
              : "0.00"
          )
          .join(" | ")} |`
    );
    const totalsRow = `| Total Before Extras | ${billResult.baseTotals
      .map((total) => total.toFixed(2))
      .join(" | ")} |`;
    const finalTotalsRow = `| Final Total | ${billResult.personTotals
      .map((total) => total.toFixed(2))
      .join(" | ")} |`;
    const grandTotalRow = `| Grand Total | ${billResult.personTotals
      .reduce((a, b) => a + b, 0)
      .toFixed(2)} |`;

    const tableText = [
      header,
      separator,
      ...rows,
      totalsRow,
      finalTotalsRow,
      grandTotalRow,
    ].join("\n");

    navigator.clipboard.writeText(tableText);
    alert("Table copied to clipboard!");
  };

  return (
    <div className="p-4">
      <div className="flex items-center">
        <img src={logo} alt="Logo" className="w-12 h-12 mr-4" />
        <h1 className="text-2xl font-bold mb-4">Bill Splitter</h1>
      </div>
      <div>
        <label className="block mb-2">Number of People:</label>
        <input
          type="number"
          min="1"
          max="10"
          value={peopleCount}
          onChange={(e) => updatePeople(Number(e.target.value))}
          className="border p-2 mb-4 w-20"
        />
      </div>
      <div>
        <h2 className="text-lg font-bold mb-2">Bill Items</h2>
        {items.map((item, index) => (
          <div key={index} className="mb-4">
            <input
              type="text"
              placeholder="Item Name"
              value={item.name}
              onChange={(e) => updateItem(index, "name", e.target.value)}
              onKeyDown={(e) => handleNameKeyDown(e, index)}
              className="border p-2 mr-2"
            />
            <input
              type="number"
              value={item.price}
              ref={(el) => (priceRefs.current[index] = el)}
              onChange={(e) =>
                updateItem(index, "price", parseFloat(e.target.value) || 0)
              }
              onInput={(e) => {
                if (
                  e.target.value.startsWith("0") &&
                  !e.target.value.startsWith("0.")
                ) {
                  e.target.value = parseFloat(e.target.value); // Remove leading zero
                }
              }}
              onKeyDown={(e) => handlePriceKeyDown(e, index)}
              className="border p-2 mr-2"
            />
            <div className="flex gap-2">
              {names.map((name, i) => (
                <label key={i} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.belongsTo.includes(i)}
                    onChange={(e) => {
                      const updatedBelongsTo = e.target.checked
                        ? [...item.belongsTo, i]
                        : item.belongsTo.filter((person) => person !== i);
                      updateItem(index, "belongsTo", updatedBelongsTo);
                    }}
                    className="form-checkbox"
                  />
                  {name}
                </label>
              ))}
            </div>
          </div>
        ))}
        <div className="flex items-center">
          <button
            onClick={addItem}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
          >
            Add Item
          </button>
          <span className="text-lg font-semibold">
            Total Items Price: ₹{totalItemsPrice.toFixed(2)}
          </span>
        </div>
      </div>
      <div className="mt-4">
        <h2 className="text-lg font-bold mb-2">Discounts</h2>
        {discounts.map((discount, index) => (
          <input
            key={index}
            type="number"
            placeholder="Discount"
            value={discount}
            onChange={(e) =>
              updateDiscount(index, parseFloat(e.target.value) || 0)
            }
            onInput={(e) => {
              if (
                e.target.value.startsWith("0") &&
                !e.target.value.startsWith("0.")
              ) {
                e.target.value = parseFloat(e.target.value); // Remove leading zero
              }
            }}
            className="border p-2 mr-2 mb-2"
          />
        ))}
        <button
          onClick={addDiscount}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Discount
        </button>
      </div>
      <div className="mt-4">
        <h2 className="text-lg font-bold mb-2">Extra Charges</h2>
        {extraCharges.map((charge, index) => (
          <input
            key={index}
            type="number"
            placeholder="Extra Charge"
            value={charge}
            onChange={(e) =>
              updateExtraCharge(index, parseFloat(e.target.value) || 0)
            }
            onInput={(e) => {
              if (
                e.target.value.startsWith("0") &&
                !e.target.value.startsWith("0.")
              ) {
                e.target.value = parseFloat(e.target.value); // Remove leading zero
              }
            }}
            className="border p-2 mr-2 mb-2"
          />
        ))}
        <button
          onClick={addExtraCharge}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Extra Charge
        </button>
      </div>
      <div className="mt-4">
        <h2 className="text-lg font-bold mb-2">Tax Percentage (%)</h2>
        <input
          type="number"
          placeholder="Tax Percentage"
          value={taxPercentage}
          onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
          onInput={(e) => {
            if (
              e.target.value.startsWith("0") &&
              !e.target.value.startsWith("0.")
            ) {
              e.target.value = parseFloat(e.target.value); // Remove leading zero
            }
          }}
          className="border p-2 w-20"
        />
      </div>
      <button
        onClick={handleSubmit}
        className="bg-green-500 text-white px-4 py-2 rounded mt-4"
      >
        Split Bill
      </button>
      {billResult && (
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-4">Bill Breakdown</h2>
          <table className="table-auto border-collapse border border-gray-400 w-full">
            <thead>
              <tr>
                <th className="border border-gray-400 px-4 py-2">Items</th>
                {names.map((name, i) => (
                  <th key={i} className="border border-gray-400 px-4 py-2">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-400 px-4 py-2">
                    {`${
                      item.name || `Item ${index + 1}`
                    } (₹${item.price.toFixed(2)})`}
                  </td>
                  {names.map((_, i) => (
                    <td
                      key={i}
                      className="border border-gray-400 px-4 py-2 text-center"
                    >
                      {item.belongsTo.includes(i)
                        ? (item.price / item.belongsTo.length).toFixed(2)
                        : "0.00"}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="border border-gray-400 px-4 py-2 font-bold">
                  Total Before Extras
                </td>
                {billResult.baseTotals.map((total, i) => (
                  <td
                    key={i}
                    className="border border-gray-400 px-4 py-2 text-center"
                  >
                    {total.toFixed(2)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-gray-400 px-4 py-2 font-bold">
                  Discount/Extra Charges/Tax
                </td>
                {billResult.baseTotals.map((baseTotal, i) => {
                  const finalTotal = billResult.personTotals[i];
                  const taxAmount = (baseTotal * (taxPercentage / 100)).toFixed(
                    2
                  );
                  const extraChargeAmount = (
                    extraCharges.reduce((sum, charge) => sum + charge, 0) *
                    (baseTotal /
                      billResult.baseTotals.reduce((a, b) => a + b, 0))
                  ).toFixed(2);
                  const discountAmount = (
                    discounts.reduce((sum, discount) => sum + discount, 0) *
                    (baseTotal /
                      billResult.baseTotals.reduce((a, b) => a + b, 0))
                  ).toFixed(2);

                  return (
                    <td
                      key={i}
                      className="border border-gray-400 px-4 py-2 text-center"
                    >
                      {`-${discountAmount}/+${extraChargeAmount}/+${taxAmount}`}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="border border-gray-400 px-4 py-2 font-bold">
                  Final Total
                </td>
                {billResult.personTotals.map((total, i) => (
                  <td
                    key={i}
                    className="border border-gray-400 px-4 py-2 text-center"
                  >
                    {total.toFixed(2)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-gray-400 px-4 py-2 font-bold">
                  Grand Total
                </td>
                <td
                  colSpan={peopleCount}
                  className="border border-gray-400 px-4 py-2 text-center"
                >
                  ₹
                  {billResult.personTotals
                    .reduce((a, b) => a + b, 0)
                    .toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
          <button
            onClick={copyTable}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          >
            Copy Table
          </button>
        </div>
      )}
    </div>
  );
}
