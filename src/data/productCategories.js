// Product categorization function
export const categorizeProduct = (product) => {
    const lowerProduct = product.toLowerCase();
  
    // Protein and health foods
    if (lowerProduct.includes('gatorade protein bar') || 
        lowerProduct.includes('granola') || 
        lowerProduct.includes('trail mix') || 
        lowerProduct.includes('cashews') || 
        lowerProduct.includes('almond') ||
        lowerProduct.includes('protein')) {
      return 'Healthy Snacks';
    }
  
    // Energy drinks
    if (lowerProduct.includes('red bull') || 
        lowerProduct.includes('monster') || 
        lowerProduct.includes('celsius') || 
        lowerProduct.includes('propel') || 
        lowerProduct.includes('gatorade') ||
        lowerProduct.includes('gatorlyte') ||
        lowerProduct.includes('body armor') ||
        lowerProduct.includes('vitamin water') ||
        lowerProduct.includes('fairlife') ||
        lowerProduct.includes('storm') ||
        lowerProduct.includes('starbuck') ||
        lowerProduct.includes('powerade')) {
      return 'Energy/Electrolyte Drinks';
    }
  
    // Sodas and drinks
    if (lowerProduct.includes('water') || 
        lowerProduct.includes('pepsi') || 
        lowerProduct.includes('dew') || 
        lowerProduct.includes('tea') || 
        lowerProduct.includes('coca') ||
        lowerProduct.includes('mellow') ||
        lowerProduct.includes('dr. pepper') ||
        lowerProduct.includes('fruit punch') ||
        lowerProduct.includes('coke') ||
        lowerProduct.includes('sprite') ||
        lowerProduct.includes('topo chico') ||
        lowerProduct.includes('lemonade') ||
        lowerProduct.includes('cheerwine') ||
        lowerProduct.includes('strawberry') ||
        lowerProduct.includes('ginger ale') ||
        lowerProduct.includes('starry') ||
        lowerProduct.includes('apple juice') ||
        lowerProduct.includes('orange juice') ||
        lowerProduct.includes('grape juice') ||
        lowerProduct.includes('fanta')) {
          
      return 'Sodas & Drinks';
    }
    
    // Chips and savory snacks
    if (lowerProduct.includes('lays') || 
        lowerProduct.includes('cheetos') || 
        lowerProduct.includes('doritos') || 
        lowerProduct.includes('fritos') || 
        lowerProduct.includes('pringle') || 
        lowerProduct.includes('funyun') || 
        lowerProduct.includes('pork') || 
        lowerProduct.includes('popcorn') || 
        lowerProduct.includes('chex') || 
        lowerProduct.includes('chips') || 
        lowerProduct.includes('sun chips') || 
        lowerProduct.includes('cheez it') || 
        lowerProduct.includes('gardettos') || 
        lowerProduct.includes('crackers') ||
        lowerProduct.includes('ruffles') ||
        lowerProduct.includes('tuna') ||
        lowerProduct.includes('gold') ||
        lowerProduct.includes('pop') ||
        lowerProduct.includes('veggie') ||
        lowerProduct.includes('cheddar')|| 
        lowerProduct.includes('cheese') ||
        lowerProduct.includes('chester') ||
        lowerProduct.includes('pretzel')) {
      return 'Chips & Savory Snacks';
    }
    
    // Candy and sweets
    if (lowerProduct.includes('oreos') || 
        lowerProduct.includes('snickers') || 
        lowerProduct.includes('kitkat') || 
        lowerProduct.includes('kit kat') || 
        lowerProduct.includes('fruit snack') || 
        lowerProduct.includes('reese') || 
        lowerProduct.includes('twix') || 
        lowerProduct.includes('butterfinger') || 
        lowerProduct.includes('rice krispies treats') || 
        lowerProduct.includes('muska') || 
        lowerProduct.includes('kinder') || 
        lowerProduct.includes('Pop') || 
        lowerProduct.includes('haribo') || 
        lowerProduct.includes('cookie') || 
        lowerProduct.includes('m&m') || 
        lowerProduct.includes('payday') || 
        lowerProduct.includes('candy') || 
        lowerProduct.includes('ghirardelli') || 
        lowerProduct.includes('airhead') || 
        lowerProduct.includes('skittles') || 
        lowerProduct.includes('gummies') || 
        lowerProduct.includes('gushers') || 
        lowerProduct.includes('nerds') ||
        lowerProduct.includes('honey bun') ||
        lowerProduct.includes('worm') ||
        lowerProduct.includes('mike')||
        lowerProduct.includes('crunch')) {
      return 'Candy & Sweets';
    }
    
    // Default category for anything else
    return 'Other Snacks';
  };
  
  // Concise, user-facing type label for a single product (e.g. "Soda", "Energy Drink",
  // "Chips"). Used for the tag shown next to each item. Order matters: more specific
  // checks come before broader ones (e.g. "Diet Soda" before "Soda", "Chocolate" before
  // "Nuts" so "Reese's Peanut Butter Cups" reads as Chocolate).
  export const getProductLabel = (product) => {
    const p = (product || '').toLowerCase();

    // Protein/energy bars first, so "Gatorade Protein Bar" and "Clif Bar" aren't caught
    // by the drink/chocolate rules below.
    if (/protein bar|clif|think!?/.test(p)) return 'Protein Bar';

    // --- Drinks ---
    if (/zero sugar|zero|diet/.test(p) && /coke|cola|pepsi|dew|soda|starry|sprite|fanta|dr\.? pepper|mug/.test(p)) return 'Diet Soda';
    if (/celsius|monster|red bull|bang|reign|rockstar|kickstart/.test(p)) return 'Energy Drink';
    if (/fairlife|core power/.test(p)) return 'Protein Shake';
    if (/gatorade|powerade|gatorlyte|body ?armor|propel|vitamin water/.test(p)) return 'Sports Drink';
    if (/starbucks|cold brew|coffee|cappuccino|mocha|frappuccino|triple shot|double shot|espresso/.test(p)) return 'Coffee';
    if (/sweet tea|pure leaf|gold peak|lipton|\btea\b/.test(p)) return 'Tea';
    if (/juice|lemonade|fruit punch/.test(p)) return 'Juice';
    if (/topo chico|sparkling|bubly|\bwater\b/.test(p)) return 'Water';
    if (/pepsi|coca cola|\bcoke\b|mountain dew|\bdew\b|sprite|starry|fanta|dr\.? pepper|root beer|mug|storm|crush|cherry|cheerwine|mellow yellow|mello yello|ginger ale|sunkist|schweppes|seagrams/.test(p)) return 'Soda';

    // --- Snacks ---
    if (/lays|doritos|cheetos|fritos|pringles|ruffles|sun chips|funyuns|popchips|veggie straws|veggie toasted|bugles|pork rinds|chester|fries|zapp|\bchips\b/.test(p)) return 'Chips';
    if (/popcorn|smartfood/.test(p)) return 'Popcorn';
    if (/pretzel/.test(p)) return 'Pretzels';
    if (/cheez ?it|goldfish|gold fish|crackers|chex mix|gardettos/.test(p)) return 'Crackers';
    if (/oreo|cookie/.test(p)) return 'Cookies';
    if (/gummy|gummies|haribo|skittles|nerds|gushers|mike ?& ?ike|mike and ike|trolli|sour patch|fruit snack|airhead|worm/.test(p)) return 'Gummies';
    if (/snickers|kit ?kat|reese|twix|m& ?ms?|m and m|kinder|ghirardelli|butterfinger|hershey|crunch|payday|muskateers|chocolate/.test(p)) return 'Chocolate';
    if (/nature valley|granola|nutra ?grain|nutri ?grain|rice krispies|biscuit/.test(p)) return 'Granola Bar';
    if (/clif|protein bar/.test(p)) return 'Protein Bar';
    if (/trail mix|cashew|pistachio|almond|peanut|\bnuts\b/.test(p)) return 'Nuts';
    if (/slim jim|jerky|beef|tender bites/.test(p)) return 'Jerky';
    if (/honey bun|pop ?-?tart|donut|muffin|pastry/.test(p)) return 'Pastry';

    return 'Snack';
  };

  // Group products by category
  export const groupProductsByCategory = (products) => {
    const grouped = {};
    
    products.forEach(product => {
      const category = categorizeProduct(product);
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(product);
    });
    
    return grouped;
  };