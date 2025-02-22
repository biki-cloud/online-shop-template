import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Online Shop",
  description: "高品質な商品を取り揃えたオンラインショップです。",
};

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-16">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden rounded-xl">
        <Image
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070"
          alt="Fashion Hero"
          fill
          className="object-cover transition-transform hover:scale-105 duration-700"
          priority
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="text-center text-white space-y-4">
            <h1 className="text-5xl font-bold animate-fade-up">
              Explore Our Latest Collection Of Goggles
            </h1>
            <Button
              variant="outline"
              size="lg"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300"
              asChild
            >
              <Link href="/products">Shop Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Shop Collection */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">SHOP BY COLLECTION</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Fashion",
              image:
                "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc",
            },
            {
              title: "Summer Specials",
              image:
                "https://images.unsplash.com/photo-1469334031218-e382a71b716b",
            },
            {
              title: "New Arrivals",
              image:
                "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93",
            },
            {
              title: "Popular Products",
              image:
                "https://images.unsplash.com/photo-1445205170230-053b83016050",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-lg hover:shadow-xl transition-all duration-300"
            >
              <AspectRatio ratio={1}>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-110 duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <h3 className="text-white text-xl font-semibold">
                    {item.title}
                  </h3>
                </div>
              </AspectRatio>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Collection */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">FEATURE COLLECTION</h2>
        <Carousel className="w-full">
          <CarouselContent>
            {[
              {
                title: "Winter Fashion Dress",
                price: "$140.00",
                image:
                  "https://images.unsplash.com/photo-1434389677669-e08b4cac3105",
              },
              {
                title: "Summer Style Trends",
                price: "$120.00",
                image:
                  "https://images.unsplash.com/photo-1469334031218-e382a71b716b",
              },
              {
                title: "Casual Collection",
                price: "$99.00",
                image:
                  "https://images.unsplash.com/photo-1485968579580-b6d095142e6e",
              },
              {
                title: "Spring Collection",
                price: "$160.00",
                image:
                  "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93",
              },
            ].map((item, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <Card className="overflow-hidden group">
                  <AspectRatio ratio={3 / 4}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105 duration-500"
                    />
                  </AspectRatio>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-muted-foreground">{item.price}</p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

      {/* Customer Reviews */}
      <section className="space-y-8 bg-muted/50 py-16 px-4 rounded-xl">
        <h2 className="text-3xl font-bold text-center">
          Our Delighted Customer's
        </h2>
        <Carousel className="w-full">
          <CarouselContent>
            {[
              {
                name: "John Smith",
                role: "Fashion Enthusiast",
                comment:
                  "The best online store I've ever used. The quality is amazing!",
                avatar:
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
              },
              {
                name: "Emma Davis",
                role: "Style Consultant",
                comment:
                  "Excellent service and amazing products. Highly recommended!",
                avatar:
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
              },
              {
                name: "Michael Brown",
                role: "Regular Customer",
                comment:
                  "Great prices and fantastic selection. Will definitely shop again!",
                avatar:
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
              },
            ].map((review, index) => (
              <CarouselItem
                key={index}
                className="md:basis-1/2 lg:basis-1/3 p-4"
              >
                <Card className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={review.avatar}
                        alt={review.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold">{review.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {review.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

      {/* Instagram Section */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">#FASHION-INSTAGRAM</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            "https://images.unsplash.com/photo-1485968579580-b6d095142e6e",
            "https://images.unsplash.com/photo-1469334031218-e382a71b716b",
            "https://images.unsplash.com/photo-1434389677669-e08b4cac3105",
            "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93",
            "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc",
            "https://images.unsplash.com/photo-1445205170230-053b83016050",
          ].map((image, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-lg hover:shadow-xl transition-all duration-300"
            >
              <AspectRatio ratio={1}>
                <Image
                  src={image}
                  alt={`Instagram post ${index + 1}`}
                  fill
                  className="object-cover transition-transform group-hover:scale-110 duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
              </AspectRatio>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
