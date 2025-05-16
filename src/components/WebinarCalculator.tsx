import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

type ExpertiseLevel = "Novice" | "Proficient" | "Expert" | "Custom";

interface WebinarCalculatorProps {
  onSubmit?: (data: any) => void;
  bookingUrl?: string;
}

const WebinarCalculator: React.FC<WebinarCalculatorProps> = ({ 
  onSubmit,
  bookingUrl = "https://calendly.com/example/webinar-strategy-call"
}) => {
  const [expertise, setExpertise] = useState<ExpertiseLevel>("Proficient");
  const [pageViews, setPageViews] = useState<number>(1000);
  const [avgSaleValue, setAvgSaleValue] = useState<number>(500);
  const [webinarsPerYear, setWebinarsPerYear] = useState<number>(12);
  
  // Custom conversion rates
  const [customPageConv, setCustomPageConv] = useState<number>(40);
  const [customShowUp, setCustomShowUp] = useState<number>(40);
  const [customConsult, setCustomConsult] = useState<number>(15);
  const [customSale, setCustomSale] = useState<number>(40);
  
  // Optional toggles
  const [includeCosts, setIncludeCosts] = useState<boolean>(false);
  const [includeBrand, setIncludeBrand] = useState<boolean>(false);
  
  // Optional inputs
  const [platformCost, setPlatformCost] = useState<number>(99);
  const [adSpend, setAdSpend] = useState<number>(500);
  const [staffingCost, setStaffingCost] = useState<number>(200);
  const [brandValue, setBrandValue] = useState<number>(10);
  
  // Calculation results
  const [results, setResults] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
  }, [
    expertise, pageViews, avgSaleValue, webinarsPerYear,
    customPageConv, customShowUp, customConsult, customSale,
    includeCosts, includeBrand,
    platformCost, adSpend, staffingCost, brandValue
  ]);

  const calculateResults = () => {
    // Calculate conversion rates based on expertise level
    let pageConv = expertise === 'Novice' ? 0.30
                 : expertise === 'Proficient' ? 0.40
                 : expertise === 'Expert' ? 0.40
                 : customPageConv / 100;
    
    let showUpRate = expertise === 'Novice' ? 0.30
                   : expertise === 'Proficient' ? 0.40
                   : expertise === 'Expert' ? 0.50
                   : customShowUp / 100;
    
    let consultConv = expertise === 'Novice' ? 0.10
                    : expertise === 'Proficient' ? 0.15
                    : expertise === 'Expert' ? 0.30
                    : customConsult / 100;
    
    let saleConv = expertise === 'Novice' ? 0.30
                 : expertise === 'Proficient' ? 0.40
                 : expertise === 'Expert' ? 0.60
                 : customSale / 100;

    // Core calculations for a single webinar - replace invites with pageViews
    const registrations = pageViews * pageConv;
    const attendees = registrations * showUpRate;
    const consultCalls = attendees * consultConv;
    const sales = consultCalls * saleConv;
    const revenue = sales * avgSaleValue;

    // Optional ROIs
    const totalCost = includeCosts ? platformCost + adSpend + staffingCost : 0;
    const profit = revenue - totalCost;
    const brandLift = includeBrand ? attendees * brandValue : 0;

    // Annual totals
    const annualRegs = registrations * webinarsPerYear;
    const annualRevenue = revenue * webinarsPerYear;
    const annualProfit = profit * webinarsPerYear;
    const annualBrand = brandLift * webinarsPerYear;

    // Store results
    setResults({
      single: {
        registrations,
        attendees,
        consultCalls,
        sales,
        revenue,
        profit: includeCosts ? profit : null,
        brandLift: includeBrand ? brandLift : null,
        totalValue: revenue + (includeBrand ? brandLift : 0),
      },
      annual: {
        registrations: annualRegs,
        revenue: annualRevenue,
        profit: includeCosts ? annualProfit : null,
        brandLift: includeBrand ? annualBrand : null,
        totalValue: annualRevenue + (includeBrand ? annualBrand : 0),
      }
    });

    // Generate chart data for cumulative revenue over time
    const chartData = [];
    let cumulativeRevenue = 0;
    let cumulativeProfit = 0;
    
    for (let i = 1; i <= webinarsPerYear; i++) {
      cumulativeRevenue += revenue;
      cumulativeProfit += profit;
      
      chartData.push({
        webinar: i,
        revenue: cumulativeRevenue,
        profit: includeCosts ? cumulativeProfit : undefined,
      });
    }
    
    setChartData(chartData);
    
    // If onSubmit handler is provided, call it with the results
    if (onSubmit) {
      onSubmit({
        inputs: {
          expertise,
          pageViews,
          avgSaleValue,
          webinarsPerYear,
          includeCosts,
          includeBrand,
        },
        results: {
          single: {
            revenue,
            profit: includeCosts ? profit : null,
          },
          annual: {
            revenue: annualRevenue,
            profit: includeCosts ? annualProfit : null,
          }
        }
      });
    }
  };

  const handleBookCall = () => {
    // Create a URL with UTM parameters based on inputs
    const utmParams = new URLSearchParams({
      utm_source: 'roi_calculator',
      utm_medium: 'website',
      utm_campaign: 'webinar_strategy',
      utm_content: `${expertise}_${pageViews}_${avgSaleValue}_${webinarsPerYear}`
    }).toString();
    
    // Open the booking URL with UTM parameters
    window.open(`${bookingUrl}?${utmParams}`, '_blank');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Logo and title */}
      <div className="flex flex-col items-center mb-8">
        <img 
          src="/lovable-uploads/4ed7b4df-dd4b-4e5c-9db9-8f0f5cbaac41.png" 
          alt="GTex Logo" 
          className="h-16 mb-4" 
        />
        <h1 className="text-3xl md:text-4xl font-bold text-brand-blue">Webinar ROI Calculator</h1>
        <p className="text-lg text-center text-text mt-2">
          Discover the potential return on investment from your webinar marketing strategy
        </p>
      </div>

      {/* Input section */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expertise Level */}
            <div className="space-y-2">
              <Label htmlFor="expertise" className="text-brand-blue font-medium">Expertise Level</Label>
              <Select
                value={expertise}
                onValueChange={(value) => setExpertise(value as ExpertiseLevel)}
              >
                <SelectTrigger id="expertise">
                  <SelectValue placeholder="Select Expertise Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Novice">Novice</SelectItem>
                  <SelectItem value="Proficient">Proficient</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Page Views (formerly Invite List Size) */}
            <div className="space-y-2">
              <Label htmlFor="pageViews" className="text-brand-blue font-medium">Page Views</Label>
              <Input
                id="pageViews"
                type="number"
                min="1"
                value={pageViews}
                onChange={(e) => setPageViews(Number(e.target.value))}
              />
            </div>

            {/* Average Sale Value */}
            <div className="space-y-2">
              <Label htmlFor="avgSaleValue" className="text-brand-blue font-medium">Average Revenue per Sale (£)</Label>
              <Input
                id="avgSaleValue"
                type="number"
                min="1"
                value={avgSaleValue}
                onChange={(e) => setAvgSaleValue(Number(e.target.value))}
              />
            </div>

            {/* Webinars per Year */}
            <div className="space-y-2">
              <Label htmlFor="webinarsPerYear" className="text-brand-blue font-medium">Number of Webinars</Label>
              <Input
                id="webinarsPerYear"
                type="number"
                min="1"
                max="100"
                value={webinarsPerYear}
                onChange={(e) => setWebinarsPerYear(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Custom rates (only shown when Custom is selected) */}
          {expertise === "Custom" && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-brand-blue font-semibold mb-4">Custom Conversion Rates (%)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="customPageConv" className="text-text">Landing Page Conversion</Label>
                  <Input
                    id="customPageConv"
                    type="number"
                    min="1"
                    max="100"
                    value={customPageConv}
                    onChange={(e) => setCustomPageConv(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customShowUp" className="text-text">Show-up Rate</Label>
                  <Input
                    id="customShowUp"
                    type="number"
                    min="1"
                    max="100"
                    value={customShowUp}
                    onChange={(e) => setCustomShowUp(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customConsult" className="text-text">Consultation Conversion</Label>
                  <Input
                    id="customConsult"
                    type="number"
                    min="1"
                    max="100"
                    value={customConsult}
                    onChange={(e) => setCustomConsult(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customSale" className="text-text">Sale Conversion</Label>
                  <Input
                    id="customSale"
                    type="number"
                    min="1"
                    max="100"
                    value={customSale}
                    onChange={(e) => setCustomSale(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Optional Toggles */}
          <div className="mt-6 border-t pt-6">
            <h3 className="text-brand-blue font-semibold mb-4">Optional Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="includeCosts" className="cursor-pointer">Include Costs?</Label>
                <Switch
                  id="includeCosts"
                  checked={includeCosts}
                  onCheckedChange={setIncludeCosts}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="includeBrand" className="cursor-pointer">Include Brand Lift?</Label>
                <Switch
                  id="includeBrand"
                  checked={includeBrand}
                  onCheckedChange={setIncludeBrand}
                />
              </div>
            </div>
          </div>

          {/* Cost inputs (only shown when Include Costs is toggled on) */}
          {includeCosts && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-brand-blue font-semibold mb-4">Cost Details (£ per webinar)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="platformCost" className="text-text">Platform Cost</Label>
                  <Input
                    id="platformCost"
                    type="number"
                    min="0"
                    value={platformCost}
                    onChange={(e) => setPlatformCost(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adSpend" className="text-text">Ad Spend</Label>
                  <Input
                    id="adSpend"
                    type="number"
                    min="0"
                    value={adSpend}
                    onChange={(e) => setAdSpend(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staffingCost" className="text-text">Staffing Cost</Label>
                  <Input
                    id="staffingCost"
                    type="number"
                    min="0"
                    value={staffingCost}
                    onChange={(e) => setStaffingCost(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Brand Lift inputs (only shown when Include Brand Lift is toggled on) */}
          {includeBrand && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-brand-blue font-semibold mb-4">Brand Value</h3>
              <div className="grid grid-cols-1 gap-6 max-w-xs">
                <div className="space-y-2">
                  <Label htmlFor="brandValue" className="text-text">Value per Impression (£)</Label>
                  <Input
                    id="brandValue"
                    type="number"
                    min="0"
                    value={brandValue}
                    onChange={(e) => setBrandValue(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {results && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-center text-brand-blue">Your Webinar ROI Results</h2>

          {/* Single Webinar Results */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-brand-blue">Per Webinar Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-white shadow-md">
                <CardContent className="p-4">
                  <h4 className="text-sm text-brand-gold font-medium">Registrations</h4>
                  <p className="text-2xl font-bold">{Math.round(results.single.registrations)}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-md">
                <CardContent className="p-4">
                  <h4 className="text-sm text-brand-gold font-medium">Attendees</h4>
                  <p className="text-2xl font-bold">{Math.round(results.single.attendees)}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-md">
                <CardContent className="p-4">
                  <h4 className="text-sm text-brand-gold font-medium">Consult Calls</h4>
                  <p className="text-2xl font-bold">{Math.round(results.single.consultCalls)}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-md">
                <CardContent className="p-4">
                  <h4 className="text-sm text-brand-gold font-medium">Sales</h4>
                  <p className="text-2xl font-bold">{Math.round(results.single.sales)}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-md">
                <CardContent className="p-4">
                  <h4 className="text-sm text-brand-gold font-medium">Revenue</h4>
                  <p className="text-2xl font-bold">£{formatCurrency(results.single.revenue)}</p>
                </CardContent>
              </Card>
              
              {includeCosts && (
                <Card className="bg-white shadow-md">
                  <CardContent className="p-4">
                    <h4 className="text-sm text-brand-gold font-medium">Profit</h4>
                    <p className="text-2xl font-bold">£{formatCurrency(results.single.profit)}</p>
                  </CardContent>
                </Card>
              )}
              
              {includeBrand && (
                <Card className="bg-white shadow-md">
                  <CardContent className="p-4">
                    <h4 className="text-sm text-brand-gold font-medium">Brand Lift Value</h4>
                    <p className="text-2xl font-bold">£{formatCurrency(results.single.brandLift)}</p>
                  </CardContent>
                </Card>
              )}
              
              <Card className="bg-white shadow-md">
                <CardContent className="p-4">
                  <h4 className="text-sm text-brand-gold font-medium">Total Value</h4>
                  <p className="text-2xl font-bold">£{formatCurrency(results.single.totalValue)}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Annual Results */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-brand-blue">Annual Results (× {webinarsPerYear} webinars)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="bg-white shadow-md">
                <CardContent className="p-4">
                  <h4 className="text-sm text-brand-gold font-medium">Total Registrations</h4>
                  <p className="text-2xl font-bold">{Math.round(results.annual.registrations)}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-md">
                <CardContent className="p-4">
                  <h4 className="text-sm text-brand-gold font-medium">Total Revenue</h4>
                  <p className="text-2xl font-bold">£{formatCurrency(results.annual.revenue)}</p>
                </CardContent>
              </Card>
              
              {includeCosts && (
                <Card className="bg-white shadow-md">
                  <CardContent className="p-4">
                    <h4 className="text-sm text-brand-gold font-medium">Total Profit</h4>
                    <p className="text-2xl font-bold">£{formatCurrency(results.annual.profit)}</p>
                  </CardContent>
                </Card>
              )}
              
              {includeBrand && (
                <Card className="bg-white shadow-md">
                  <CardContent className="p-4">
                    <h4 className="text-sm text-brand-gold font-medium">Total Brand Value</h4>
                    <p className="text-2xl font-bold">£{formatCurrency(results.annual.brandLift)}</p>
                  </CardContent>
                </Card>
              )}
              
              <Card className="bg-white shadow-md md:col-span-1">
                <CardContent className="p-4">
                  <h4 className="text-sm text-brand-gold font-medium">Total Value</h4>
                  <p className="text-2xl font-bold">£{formatCurrency(results.annual.totalValue)}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Chart */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-brand-blue">Cumulative Returns</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="webinar" 
                    label={{ value: 'Webinar #', position: 'insideBottom', offset: -5 }} 
                  />
                  <YAxis 
                    tickFormatter={(value) => `£${formatCurrency(Number(value))}`} 
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value) => [`£${formatCurrency(Number(value))}`, undefined]}
                    labelFormatter={(label) => `Webinar ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Cumulative Revenue" 
                    stroke="#023a7c" 
                    strokeWidth={2} 
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  {includeCosts && (
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      name="Cumulative Profit" 
                      stroke="#bda14d" 
                      strokeWidth={2} 
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Text */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 my-8">
            <h3 className="text-xl font-semibold mb-2 text-brand-blue">Summary</h3>
            <p className="text-lg text-text">
              With <strong>{pageViews.toLocaleString()}</strong> page views and an average sale of <strong>£{avgSaleValue.toLocaleString()}</strong>, 
              you'll make <strong>£{formatCurrency(results.single.revenue)}</strong> in one webinar 
              and <strong>£{formatCurrency(results.annual.revenue)}</strong> over {webinarsPerYear} webinars
              {includeCosts && ` — after costs, that's £${formatCurrency(results.annual.profit)} profit`}
              {includeBrand && `. Plus, an estimated £${formatCurrency(results.annual.brandLift)} of brand-lift value`}.
            </p>
          </div>

          {/* Call to Action */}
          <div className="text-center my-10">
            <Button 
              onClick={handleBookCall}
              className="bg-brand-gold hover:bg-brand-gold/90 text-white px-8 py-6 text-lg"
            >
              Book Your Strategy Call
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebinarCalculator;
