"use client"
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2 } from "lucide-react";

const Home = ({ clientId }) => {
  const [productRows, setProductRows] = useState([
    {
      id: Date.now(),
      productId: "",
      warehouseId: "",
      quantity: "",
    },
  ]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Sample data - replace with your actual data
  const products = [
    { id: "1", name: "Product 1" },
    { id: "2", name: "Product 2" },
  ];

  const warehouses = [
    { id: "1", name: "Warehouse 1" },
    { id: "2", name: "Warehouse 2" },
  ];

  const addProductRow = () => {
    setProductRows([
      ...productRows,
      {
        id: Date.now(),
        productId: "",
        warehouseId: "",
        quantity: "",
      },
    ]);
  };

  const removeProductRow = (id) => {
    setProductRows(productRows.filter((row) => row.id !== id));
  };

  const handleInputChange = (id, field, value) => {
    setProductRows(
      productRows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = axios.post("/", productRows);
        // if (!response) {
        //   alert("Some Error Occured check the console!");
        //   return;
        //   }
          alert("Order Created!");
      } catch (error) {
        console.error("Error sending the product data", response.data.message)
      }
    setError("");
    setSuccess("");

    const products = productRows.reduce((acc, row) => {
      const existingProduct = acc.find((p) => p.product_id === row.productId);
      if (existingProduct) {
        existingProduct.warehouses.push({
          warehouse_id: row.warehouseId,
          quantity: parseInt(row.quantity),
        });
      } else {
        acc.push({
          product_id: row.productId,
          warehouses: [
            {
              warehouse_id: row.warehouseId,
              quantity: parseInt(row.quantity),
            },
          ],
        });
      }
      return acc;
    }, []);

    try {
      const response = await fetch(`/create_order/${clientId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": document.cookie
            .split("; ")
            .find((row) => row.startsWith("csrftoken="))
            ?.split("=")[1],
        },
        body: JSON.stringify({ products }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order.");
      }

      setSuccess(data.message);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create Order</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {productRows.map((row) => (
              <div key={row.id} className="flex items-end gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`product-${row.id}`}>Product</Label>
                  <Select
                    value={row.productId}
                    onValueChange={(value) =>
                      handleInputChange(row.id, "productId", value)
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`warehouse-${row.id}`}>Warehouse</Label>
                  <Select
                    value={row.warehouseId}
                    onValueChange={(value) =>
                      handleInputChange(row.id, "warehouseId", value)
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`quantity-${row.id}`}>Quantity</Label>
                  <Input
                    type="number"
                    value={row.quantity}
                    onChange={(e) =>
                      handleInputChange(row.id, "quantity", e.target.value)
                    }
                    className="w-24"
                    min="1"
                    required
                  />
                </div>

                {productRows.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeProductRow(row.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={addProductRow}>
              Add Product
            </Button>
            <Button type="submit">Create Order</Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default Home;
