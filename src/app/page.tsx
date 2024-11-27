'use client'
import { useState, useEffect } from 'react';
import { useUserContext } from '@/components/context/useUser';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar/sidebar';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale } from 'chart.js';
import 'chart.js/auto';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale);

interface TopProducts {
  name: string;
  sold: number;
}

interface Sales {
  time: string;
  items?: string[];
  finalPrice: number;
  averageRevenue?: number;
  avaregeSale?: number;
  productsSold?: {
    [key: string]: number;
  }
  daySales?: {
    [key: string]: {
      [key: string]: number;
    }
  }
}



export default function Page() {
  const router = useRouter();
  const { loading, user } = useUserContext();
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [salesData, setSalesData] = useState<Sales[]>([]);
  const [topProducts, setTopProducts] = useState<TopProducts[]>([]);
  const [month, setMonth] = useState<1 | 2 | 3 | 4 | 5 | 7 |8 |9 |10 |11| 12 | number>(1);
  const [day, setDay] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | number>(1);
  const [selection, setSelection] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user && router) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    // Lekérjük az adatokat az API-ból a kiválasztott időszak szerint
    fetchSalesData();
  }, [timePeriod]);

  useEffect(() => {
    // Lekérjük az adatokat az API-ból a kiválasztott hónap szerint
    fetchRankingData(month, 'month');
  }, [month, selection]);

  useEffect(() => {
    // Lekérjük az adatokat az API-ból a kiválasztott nap szerint
    fetchRankingData(day, 'day');
  }, [day, selection]);

  const fetchSalesData = async () => {
    try {
      const startDate = '2023-01-01T00:00:00.000Z';  // Az intervallum kezdete
      const endDate = new Date();    // Az intervallum vége
      const res = await fetch(`/api/sales?period=${timePeriod}&startDate=${startDate}&endDate=${endDate}`);
      const data = await res.json();
  
      if (res.ok) {
        console.log(data);
        // Frissített struktúra az API szerint
        setSalesData(data.salesData as Sales[]); // Bevételi adatok beállítása
      } else {
        console.error('Error fetching sales data:', data.error);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  const fetchRankingData = async (timeValue: number, type: string) => {
    try {
      // Lekérdezési intervallum egy teljes évre
      const startDate = new Date(new Date().getFullYear() - 1, 0, 1).toISOString();
      const endDate = new Date().toISOString();
  
      // Adatok lekérdezése az API-ból
      const res = await fetch(`/api/sales?period=daily&startDate=${startDate}&endDate=${endDate}`);
      const data = await res.json();
  
      if (res.ok) {
        const salesData: Sales[] = data.salesData;
  
        if (type === 'month') {
          // Szűrés az adott hónapra
          const filteredData = salesData.filter((sale) => {
            const saleDate = new Date(sale.time);
            return saleDate.getMonth() + 1 === timeValue; // Hónap index +1
          });
  
          calculateStats(filteredData, 'month');
        } else if (type === 'day') {
          // Szűrés az adott napra (hét napja alapján)
          const filteredData = salesData.filter((sale) => {
            const saleDate = new Date(sale.time);
            const weekDay = saleDate.getDay(); // 0 = vasárnap, 1 = hétfő, ..., 6 = szombat
            const adjustedWeekDay = weekDay === 0 ? 7 : weekDay; // 0 -> 7 (vasárnap)
            return adjustedWeekDay === timeValue; // Kiválasztott nap (pl. szerda = 3)
          });
  
          calculateStats(filteredData, 'day');
        }
      } else {
        console.error('Error fetching sales data:', data.error);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };
  
  // Statisztikák kiszámítása
  const calculateStats = (filteredData: Sales[], type: string) => {
    if (selection === 'revenue') {
      // Átlagos bevétel kiszámítása
      const totalRevenue = filteredData.reduce(
        (sum, sale) => sum + sale.finalPrice,
        0
      );
      const averageRevenue = totalRevenue / filteredData.length;
  
      setTopProducts([
        {
          name: type === 'month' ? 'Átlagos havi bevétel:' : 'Átlagos napi bevétel:',
          sold: parseInt(averageRevenue.toFixed(0)) || 0,
        },
      ]);
    } else {
      // Termék eladások összesítése
      const productSales: { [key: string]: number } = {};
  
      filteredData.forEach((sale) => {
        if (sale.productsSold) {
          Object.entries(sale.productsSold).forEach(([product, quantity]) => {
            productSales[product] = (productSales[product] || 0) + quantity;
          });
        }
      });
  
      const rankedProducts: TopProducts[] = Object.entries(productSales)
        .sort(([, a], [, b]) => b - a)
        .map(([product, sale]) => ({ name: product, sold: sale }));
  
      setTopProducts(rankedProducts);
    }
  };
  

  return (
    <div>
    {loading && <div>Loading...</div>}
    {!loading && !user && <div>Redirecting...</div>}
    {!loading && user && (
      <div className="flex flex-col lg:flex-row max-w-full min-h-screen bg-[#eed9c4] text-black overflow-x-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col p-4 space-y-6">
          {/* Gombok és diagram */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Gombok */}
            <div className="flex justify-center md:flex-col gap-2 md:w-1/5">
              <button
                onClick={() => setTimePeriod('daily')}
                className={`btn ${timePeriod === 'daily' ? 'btn-primary text-white' : 'btn-secondary btn-outline text-black'}`}
              >
                {timePeriod === 'daily' ? 'Napi' : 'Napi'}
              </button>
              <button
                onClick={() => setTimePeriod('weekly')}
                className={`btn ${timePeriod === 'weekly' ? 'btn-primary text-white' : 'btn-secondary btn-outline text-black'}`}
              >
                {timePeriod === 'weekly' ? 'Heti' : 'Heti'}
              </button>
              <button
                onClick={() => setTimePeriod('monthly')}
                className={`btn ${timePeriod === 'monthly' ? 'btn-primary text-white' : 'btn-secondary btn-outline text-black'}`}
              >
                {timePeriod === 'monthly' ? 'Havi ' : 'Havi'}
              </button>
              <button
                onClick={() => setTimePeriod('yearly')}
                className={`btn ${timePeriod === 'yearly' ? 'btn-primary text-white' : 'btn-secondary btn-outline text-black'}`}
              >
                {timePeriod === 'yearly' ? 'Éves ' : 'Éves'}
              </button>
            </div>
  
            {/* Diagram */}
            <div className="flex-1">
            <Line 
              data={{
                labels: salesData.map(sale => sale.time.split('T')[0]), // X-tengely: az időszak kezdődátuma
                datasets: [
                  {
                    label:` Átlag bevétel: ${salesData.reduce((total, sale) => total + (sale.averageRevenue ?? 0), 0).toFixed(0)}Ft`, // Első vonal
                    data: salesData.map(sale => sale.averageRevenue),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.4, // Sima vonal
                  },
                  {
                    label: `Átlag eladás: ${salesData.reduce((total, sale) => total + (sale.avaregeSale ?? 0), 0).toFixed(0)}db`, // Második vonal
                    data: salesData.map(sale => sale.avaregeSale!),
                    borderColor: 'rgb(70, 180, 50)',
                    backgroundColor: 'rgba(30, 50, 200, 0.2)',
                    tension: 0.4,
                  },
                  {
                    label: `Össz bevétel: ${salesData.reduce((total, sale) => total + sale.finalPrice, 0).toFixed(0)}Ft`, // Második vonal
                    data: salesData.map(sale => sale.finalPrice),
                    borderColor: 'rgb(192, 75, 75)',
                    backgroundColor: 'rgba(192, 75, 75, 0.2)',
                    tension: 0.4,
                  },
                  {
                    label: `Össz eladás: ${salesData.reduce((total, sale) => total + (sale.items?.length ?? 0), 0).toFixed(0)}db`, // Második vonal
                    data: salesData.map(sale => sale.items?.length),
                    borderColor: 'rgb(90, 40, 50)',
                    backgroundColor: 'rgba(100, 50, 60, 0.2)',
                    tension: 0.4,
                  },
                ],
              }} 
            />
            </div>
          </div>
  
          {/* Hónapok és top termékek */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Hónapok */}
            
  
            {/* Top termékek */}
            <div className="w-full lg:w-1/2">
              <div className="card bg-white shadow-md p-4 h-64">
                <div className="card-header font-bold text-lg">
                  <select className='select select-md'  onChange={(e)=>(setSelection(e.target.value))} value={selection ? selection : "top"}>
                    <option value="top">Termék eladások</option>
                    <option value="revenue">Bevétel</option>
                  </select></div>
                <div className="card-body h-full overflow-y-scroll">
                  {topProducts.length > 0 ? (
                    <div className=" flex flex-col gap-2 justify-between ">
                      {topProducts.map((product, index) => (
                        <div key={index} className='w-full  flex'>
                          <span >
                            {product.name}  
                          </span>
                          <span className='flex ml-auto font-bold'>
                          {product.sold} {selection === 'revenue' ? 'Ft' : 'db'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500">Nincs adat a top termékekről</div>
                  )}
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="flex flex-wrap justify-center md:justify-start">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(
                  (monthName, index) => (
                    <button
                      key={index}
                      onClick={() => setMonth(index + 1)}
                      className={`btn w-20 m-1 ${month === index + 1 ? 'btn-primary text-white' : 'btn-secondary btn-outline text-black'}`}
                    >
                      {month === index + 1 ? `${monthName}` : monthName}
                    </button>
                  )
                )}
                
              </div>
              <div className='divider'></div>
              <div className="flex flex-wrap justify-center md:justify-start">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                  (dayName, index) => (
                    <button
                      key={index}
                      onClick={() => setDay(index + 1)}
                      className={`btn w-20 m-1 ${day === index + 1 ? 'btn-primary text-white' : 'btn-secondary btn-outline text-black'}`}
                    >
                      {day === index + 1 ? `${dayName}` : dayName}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
  

  );
}
