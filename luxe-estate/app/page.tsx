'use client';

import React, { useState, useMemo } from 'react';
import { Navbar } from '@/components/layout';
import { HeroSearch, FeaturedSection, NewInMarketSection } from '@/components/home';
import { FEATURED_PROPERTIES, MARKET_PROPERTIES } from '@/data/mock-properties';
import { CategoryFilterType, ListingFilterType, Property } from '@/types/property';

export default function Home() {
  const [activeNavTab, setActiveNavTab] = useState('Buy');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterType>('all');
  const [listingFilter, setListingFilter] = useState<ListingFilterType>('all');
  const [visibleMarketCount, setVisibleMarketCount] = useState(6);

  // Sync nav tab click with listing filter
  const handleNavTabChange = (tab: string) => {
    setActiveNavTab(tab);
    if (tab === 'Buy') {
      setListingFilter('for_sale');
    } else if (tab === 'Rent') {
      setListingFilter('for_rent');
    } else if (tab === 'Saved Homes') {
      // Keep general view or could filter
    }
  };

  // Filter featured properties based on search and category
  const filteredFeatured = useMemo(() => {
    return FEATURED_PROPERTIES.filter((prop) => {
      const matchesCategory =
        selectedCategory === 'all' || prop.category === selectedCategory;
      const matchesSearch =
        searchTerm.trim() === '' ||
        prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.location.formatted.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  // Filter market properties based on search, category, and listing type
  const filteredMarket = useMemo(() => {
    return MARKET_PROPERTIES.filter((prop) => {
      const matchesCategory =
        selectedCategory === 'all' || prop.category === selectedCategory;
      const matchesSearch =
        searchTerm.trim() === '' ||
        prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.location.formatted.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesListing =
        listingFilter === 'all' || prop.listingType === listingFilter;
      return matchesCategory && matchesSearch && matchesListing;
    });
  }, [searchTerm, selectedCategory, listingFilter]);

  const displayedMarket = useMemo(() => {
    return filteredMarket.slice(0, visibleMarketCount);
  }, [filteredMarket, visibleMarketCount]);

  const hasMore = filteredMarket.length > visibleMarketCount;

  const handleLoadMore = () => {
    setVisibleMarketCount((prev) => prev + 4);
  };

  const handleSelectProperty = (property: Property) => {
    // Ready for routing to property details page `/property/${property.slug}` in upcoming milestone
    console.log('Selected property:', property.title);
  };

  return (
    <div className="min-h-screen bg-[#EEF6F6] dark:bg-[#0f231f] text-[#19322F] dark:text-white flex flex-col font-sans transition-colors duration-200">
      <Navbar activeTab={activeNavTab} onTabChange={handleNavTabChange} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <HeroSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <FeaturedSection
          properties={filteredFeatured}
          onSelectProperty={handleSelectProperty}
        />

        <NewInMarketSection
          properties={displayedMarket}
          listingFilter={listingFilter}
          onFilterChange={setListingFilter}
          onSelectProperty={handleSelectProperty}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
        />
      </main>
    </div>
  );
}
