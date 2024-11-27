import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period'); // 'daily', 'weekly', 'monthly', 'yearly'
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  try {
    const client = await clientPromise;
    const db = client.db('tokos_maci');
    const collection = db.collection('sales');


    // Lekérdezzük az adatokat az adott intervallumra
    const salesData = await collection.find({
        time: {
            $gte: startDate ? new Date(startDate) : new Date('2000-01-01'),
            $lte: endDate ? new Date(endDate) : new Date(),
        },
    }).toArray();
    if (!salesData || salesData.length === 0) {
        return NextResponse.json({ error: 'No sales data found for the selected period' }, { status: 201 });
    }

    // Időszak szerint csoportosítás
    const groupedData = groupByPeriod(salesData, period || 'daily');

    // Válasz visszaadása
    return NextResponse.json({salesData: groupedData});
  } catch (error) {
    console.error('Error fetching sales data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Csoportosítás időszak alapján
function groupByPeriod(salesData: any, period: string) {
  // Napok száma az egyes periódusokhoz
const periodDays: Record<string, number> = {
    daily: 1,
    weekly: 7,
    monthly: 30,
    yearly: 365,
};

const daysPerPeriod = periodDays[period] || 1;
const groupedData = [];
let currentGroup = [];
let currentStartDate = new Date(salesData[0].time);
let currentRevenue = 0;
let items: string[] = [];

  for (let i = 0; i < salesData.length; i++) {
    const sale = salesData[i];
    const saleDate = new Date(sale.time);
    const daysBetween = (saleDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24); // napok különbsége
    const items = sale.items;

    if (daysBetween < daysPerPeriod) {
      currentGroup.push(sale);
      currentRevenue += sale.finalPrice;
    } else {
      // Csoport lezárása és átlag kiszámítása
      groupedData.push({
        finalPrice: currentRevenue,
        time: saleDate.toISOString(),
        averageRevenue: currentRevenue / currentGroup.length,
        items: currentGroup.map((sale: any) => sale.items).flat(),
        avaregeSale: sale.items.length / currentGroup.length,
        //products sold: {item, quantity}
        productsSold: currentGroup.map((sale: any) => sale.items).flat().reduce((acc: any, item: any) => {
            if (acc[item]) {
                acc[item]++;
            } else {
                acc[item] = 1;
            }
            return acc;
            }, {}),
            daySales: currentGroup.reduce((acc: any, sale: any) => {
                const date = saleDate.toISOString(); // Assuming each sale has a date property
                if (!acc[date]) {
                  acc[date] = {};
                }
                sale.items.forEach((item: any) => {
                  if (acc[date][item]) {
                    acc[date][item]++;
                  } else {
                    acc[date][item] = 1;
                  }
                });
                return acc;
              }, {}),
      });

      // Új csoport kezdése
      currentGroup = [sale];
      currentStartDate = saleDate;
      currentRevenue = sale.finalPrice;
      items: sale.items;
      avaregeItems: sale.items.length/ currentGroup.length;
    }
  }

  // Utolsó csoport lezárása
if (currentGroup.length > 0) {
    groupedData.push({
        finalPrice: currentRevenue,
        time: new Date(currentGroup[currentGroup.length - 1].time).toISOString(),
        averageRevenue: currentRevenue / currentGroup.length,
        items: currentGroup.map((sale: any) => sale.items).flat(),
        avaregeSale: currentGroup.map((sale: any) => sale.items).flat().length / currentGroup.length,
        productSold: currentGroup.map((sale: any) => sale.items).flat().reduce((acc: any, item: any) => {
            if (acc[item]) {
                acc[item]++;
            } else {
                acc[item] = 1;
            }
            return acc;
        }  , {}),
        daySales: currentGroup.reduce((acc: any, sale: any) => {
                const date = currentStartDate.toISOString(); // Change the type of 'date' from Date to string
                if (!acc[date]) {
                    acc[date] = {};
                }
                sale.items.forEach((item: any) => {
                    if (acc[date][item]) {
                        acc[date][item]++;
                    } else {
                        acc[date][item] = 1;
                    }
                });
                return acc;
            }, {}),
    });
}

  return groupedData;
}
