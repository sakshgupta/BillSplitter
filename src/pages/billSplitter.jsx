import React, { useState, useRef, useEffect } from "react";
import "tailwindcss/tailwind.css";

export default function BillSplitter() {
  const [peopleCount, setPeopleCount] = useState(2);
  // const [names, setNames] = useState(["Person 1", "Person 2"]);
  const [items, setItems] = useState([{ name: "", price: 0, belongsTo: [] }]);
  const [discounts, setDiscounts] = useState([
    { value: 0, isPercentage: false },
  ]);
  const [extraCharges, setExtraCharges] = useState([
    { value: 0, isPercentage: false },
  ]);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [totalItemsPrice, setTotalItemsPrice] = useState(0);
  const [billResult, setBillResult] = useState(null);
  const [names, setNames] = useState(Array(peopleCount).fill(""));
  const [showNameInputs, setShowNameInputs] = useState(false);

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
    setDiscounts((prev) => [...prev, { value: 0, isPercentage: false }]);
  };

  const updateDiscount = (index, updatedDiscount) => {
    setDiscounts((prev) =>
      prev.map((discount, i) => (i === index ? updatedDiscount : discount))
    );
  };

  const addExtraCharge = () => {
    setExtraCharges((prev) => [...prev, { value: 0, isPercentage: false }]);
  };

  const updateExtraCharge = (index, updatedExtraCharges) => {
    setExtraCharges((prev) =>
      prev.map((extraCharges, i) =>
        i === index ? updatedExtraCharges : extraCharges
      )
    );
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
      var extraCharges = charge.value;
      if (charge.isPercentage) {
        extraCharges = (totalBillBeforeExtras * charge.value) / 100;
      }

      const ratio = extraCharges / totalBillBeforeExtras;
      personTotals = personTotals.map((total) => total + total * ratio);
    });

    // Apply discounts
    discounts.forEach((discount) => {
      var discountAmount = discount.value;
      if (discount.isPercentage) {
        discountAmount = (totalBillBeforeExtras * discount.value) / 100;
      }

      const ratio = discountAmount / totalBillBeforeExtras;
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

  function sanitizeNames(names) {
    return names.map((name, i) => {
      if (name && name.trim()) {
        return name.trim(); // If the name is provided and not empty, trim and return it.
      } else {
        return `Person ${i + 1}`; // Otherwise, return the default name.
      }
    });
  }

  return (
    <div className="p-4">
      <div className="relative">
        <label className="block mb-2">Number of People:</label>
        <input
          type="number"
          min="1"
          max="10"
          value={peopleCount}
          onChange={(e) => updatePeople(Number(e.target.value))}
          className="border p-2 mb-4 w-20"
        />
        <button
          onClick={() => setShowNameInputs(!showNameInputs)}
          className="absolute top-1/2 right-2 transform -translate-y-1/2"
          aria-label="Add Names"
        >
          <span
            className="block w-4 h-4 bg-gray-500 rotate-180"
            style={{
              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            }}
          ></span>
        </button>
      </div>
      {showNameInputs && (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: peopleCount }).map((_, i) => (
            <input
              key={i}
              type="text"
              onChange={(e) => {
                const newNames = [...names];
                newNames[i] = e.target.value;
                setNames(newNames);
              }}
              placeholder={`Person ${i + 1}`}
              className="border p-2"
            />
          ))}
        </div>
      )}
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
              {sanitizeNames(names).map((name, i) => (
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
          <div key={index} className="flex items-center mb-2">
            <input
              type="number"
              placeholder="Discount"
              value={discount.value}
              onChange={(e) =>
                updateDiscount(index, {
                  ...discount,
                  value: parseFloat(e.target.value) || 0,
                })
              }
              onInput={(e) => {
                if (
                  e.target.value.startsWith("0") &&
                  !e.target.value.startsWith("0.")
                ) {
                  e.target.value = parseFloat(e.target.value); // Remove leading zero
                }
              }}
              className="border p-2 mr-2"
            />
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={discount.isPercentage}
                onChange={(e) =>
                  updateDiscount(index, {
                    ...discount,
                    isPercentage: e.target.checked,
                  })
                }
                className="mr-2"
              />
              Percentage?
            </label>
          </div>
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
          <div key={index} className="flex items-center mb-2">
            <input
              key={index}
              type="number"
              placeholder="Extra Charge"
              value={charge.value}
              onChange={(e) =>
                updateExtraCharge(index, {
                  ...charge,
                  value: parseFloat(e.target.value) || 0,
                })
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
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={charge.isPercentage}
                onChange={(e) =>
                  updateExtraCharge(index, {
                    ...charge,
                    isPercentage: e.target.checked,
                  })
                }
                className="mr-2"
              />
              Percentage?
            </label>
          </div>
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
                {sanitizeNames(names).map((name, i) => (
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

                  // Calculate Tax Amount
                  const taxAmount = (baseTotal * (taxPercentage / 100)).toFixed(
                    2
                  );

                  // Calculate Extra Charges Amount
                  const extraChargeAmount = extraCharges
                    .map((charges) =>
                      charges.isPercentage
                        ? (charges.value / 100) *
                          billResult.baseTotals.reduce((a, b) => a + b, 0) *
                          (baseTotal /
                            billResult.baseTotals.reduce((a, b) => a + b, 0))
                        : charges.value *
                          (baseTotal /
                            billResult.baseTotals.reduce((a, b) => a + b, 0))
                    )
                    .reduce((sum, amount) => sum + amount, 0)
                    .toFixed(2);

                  // Calculate Discount Amount
                  const discountAmount = discounts
                    .map((discount) =>
                      discount.isPercentage
                        ? (discount.value / 100) *
                          billResult.baseTotals.reduce((a, b) => a + b, 0) *
                          (baseTotal /
                            billResult.baseTotals.reduce((a, b) => a + b, 0))
                        : discount.value *
                          (baseTotal /
                            billResult.baseTotals.reduce((a, b) => a + b, 0))
                    )
                    .reduce((sum, amount) => sum + amount, 0)
                    .toFixed(2);

                  // Combine results with "/" delimitator
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
