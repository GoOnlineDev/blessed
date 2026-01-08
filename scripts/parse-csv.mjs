import fs from 'fs';
import path from 'path';

const csvPath = path.resolve(process.cwd(), 'public/hardware.csv');
const csv = fs.readFileSync(csvPath, 'utf8');
const lines = csv.split('\n').filter(l => l.trim());

// Skip header
const products = lines.slice(1).map(line => {
    // Handle names with commas by joining everything except the last 3 columns
    // Wait, the format is Product,Ref,Buying Price,Selling Price
    // So it's name, ref, buy, sell
    const parts = line.split(',');

    // Basic CSV parsing (doesn't handle quoted commas, but this CSV looks simple)
    // selling price is the last, buying is second to last, ref is 3rd to last
    const sellPrice = parseInt(parts[parts.length - 1]) || 0;
    const buyPrice = parseInt(parts[parts.length - 2]) || 0;
    // name is everything before the last 3 parts
    const name = parts.slice(0, parts.length - 3).join(',');

    return {
        name: name || parts[0], // fallback
        buyPrice,
        sellPrice,
        stockQuantity: 0 // Initial stock is 0
    };
}).filter(p => p.name);

console.log(JSON.stringify({ products }));
