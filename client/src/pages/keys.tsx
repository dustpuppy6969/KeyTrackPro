import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyCard } from "@/components/ui/key-card";
import { useKeys } from "@/hooks/use-keys";
import { useToast } from "@/hooks/use-toast";
import { generateKeyPrefix } from "@/lib/utils";
import { KeyWithStatus } from "@/types";

export default function Keys() {
  const { toast } = useToast();
  const { keys, createKey, isLoadingKeys } = useKeys();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKey, setSelectedKey] = useState<KeyWithStatus | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newKey, setNewKey] = useState({
    keyNumber: '',
    locationName: '',
    description: '',
    keyPrefix: generateKeyPrefix(),
  });
  const [filter, setFilter] = useState<string>('all');
  
  // Filter keys based on search term and filter
  const filteredKeys = keys?.filter(key => {
    const matchesSearch = 
      key.keyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.locationName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'available') return matchesSearch && !key.isVerified && !key.isMissing;
    if (filter === 'verified') return matchesSearch && key.isVerified;
    if (filter === 'missing') return matchesSearch && key.isMissing;
    
    return matchesSearch;
  }) || [];
  
  const handleAddKey = () => {
    // Validate inputs
    if (!newKey.keyNumber.trim() || !newKey.locationName.trim()) {
      toast({
        title: "Error",
        description: "Key number and location name are required",
        variant: "destructive",
      });
      return;
    }
    
    // Create key
    createKey(newKey);
    
    // Reset form and close dialog
    setNewKey({
      keyNumber: '',
      locationName: '',
      description: '',
      keyPrefix: generateKeyPrefix(),
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Key Added",
      description: `Successfully added key #${newKey.keyNumber}`,
    });
  };
  
  const handleKeyClick = (key: KeyWithStatus) => {
    setSelectedKey(key);
  };
  
  const handleGenerateQR = (key: KeyWithStatus) => {
    // In a real app, this would generate and display a QR code
    toast({
      title: "QR Code Generated",
      description: `QR code for key #${key.keyNumber} has been generated`,
    });
  };
  
  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Key Inventory</h2>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search keys..." 
            className="bg-surface rounded-lg pl-8 pr-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="material-icons absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">search</span>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex space-x-2 mb-4 overflow-x-auto py-1">
        <button 
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filter === 'all' ? 'bg-primary text-dark font-medium' : 'bg-surface text-gray-300'}`}
          onClick={() => setFilter('all')}
        >
          All Keys
        </button>
        <button 
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filter === 'available' ? 'bg-primary text-dark font-medium' : 'bg-surface text-gray-300'}`}
          onClick={() => setFilter('available')}
        >
          Available
        </button>
        <button 
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filter === 'verified' ? 'bg-primary text-dark font-medium' : 'bg-surface text-gray-300'}`}
          onClick={() => setFilter('verified')}
        >
          Verified
        </button>
        <button 
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filter === 'missing' ? 'bg-primary text-dark font-medium' : 'bg-surface text-gray-300'}`}
          onClick={() => setFilter('missing')}
        >
          Missing
        </button>
      </div>
      
      {/* Key List */}
      <div className="space-y-3 mt-2">
        {isLoadingKeys ? (
          <Card className="bg-surface rounded-lg p-4 shadow-md text-center">
            <p className="text-sm text-gray-400">Loading keys...</p>
          </Card>
        ) : filteredKeys.length > 0 ? (
          filteredKeys.map((key) => (
            <KeyCard 
              key={key.id} 
              key={key}
              onClick={() => handleKeyClick(key)}
              actions={
                <div className="flex space-x-1">
                  <button 
                    className="p-2 rounded-full hover:bg-surface"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateQR(key);
                    }}
                  >
                    <span className="material-icons text-primary text-xl">qr_code</span>
                  </button>
                  <button className="p-2 rounded-full hover:bg-surface">
                    <span className="material-icons text-primary text-xl">more_vert</span>
                  </button>
                </div>
              }
            />
          ))
        ) : (
          <Card className="bg-surface rounded-lg p-4 shadow-md text-center">
            <p className="text-sm text-gray-400">No keys found</p>
            <p className="text-xs text-gray-500 mt-1">Add keys using the button below</p>
          </Card>
        )}
      </div>
      
      {/* Floating Action Button for adding new keys */}
      <div className="fixed bottom-20 right-4">
        <button 
          className="bg-primary text-dark w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <span className="material-icons">add</span>
        </button>
      </div>
      
      {/* Add Key Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-surface text-lightgray">
          <DialogHeader>
            <DialogTitle>Add New Key</DialogTitle>
            <DialogDescription>
              Enter the key details below to add it to the inventory.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="keyNumber">Key Number</Label>
              <Input 
                id="keyNumber" 
                placeholder="e.g. A1001" 
                className="bg-dark border-gray-700"
                value={newKey.keyNumber}
                onChange={(e) => setNewKey({...newKey, keyNumber: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="locationName">Location Name</Label>
              <Input 
                id="locationName" 
                placeholder="e.g. Maintenance Room" 
                className="bg-dark border-gray-700"
                value={newKey.locationName}
                onChange={(e) => setNewKey({...newKey, locationName: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="keyPrefix">Key Prefix</Label>
              <Input 
                id="keyPrefix" 
                placeholder="e.g. A1" 
                className="bg-dark border-gray-700"
                value={newKey.keyPrefix}
                onChange={(e) => setNewKey({...newKey, keyPrefix: e.target.value})}
              />
              <p className="text-xs text-gray-400">This will be displayed on the key card</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input 
                id="description" 
                placeholder="e.g. For accessing the maintenance area" 
                className="bg-dark border-gray-700"
                value={newKey.description || ''}
                onChange={(e) => setNewKey({...newKey, description: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              className="border-gray-700 text-lightgray"
            >
              Cancel
            </Button>
            <Button 
              className="bg-primary text-dark"
              onClick={handleAddKey}
            >
              Add Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Key Details Dialog */}
      <Dialog open={!!selectedKey} onOpenChange={() => setSelectedKey(null)}>
        {selectedKey && (
          <DialogContent className="bg-surface text-lightgray">
            <DialogHeader>
              <DialogTitle>Key Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center text-dark font-bold text-2xl">
                  {selectedKey.keyPrefix}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Key Number</p>
                  <p className="font-medium">{selectedKey.keyNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <p className={`font-medium ${selectedKey.isMissing ? 'text-error' : selectedKey.isVerified ? 'text-success' : 'text-gray-300'}`}>
                    {selectedKey.isMissing ? 'Missing' : selectedKey.isVerified ? 'Verified' : 'Available'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="font-medium">{selectedKey.locationName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Last Verified</p>
                  <p className="font-medium">
                    {selectedKey.lastVerified 
                      ? new Date(selectedKey.lastVerified).toLocaleString() 
                      : 'Never'}
                  </p>
                </div>
              </div>
              
              {selectedKey.description && (
                <div>
                  <p className="text-sm text-gray-400">Description</p>
                  <p className="font-medium">{selectedKey.description}</p>
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                <Button 
                  className="flex-1 bg-primary text-dark"
                  onClick={() => handleGenerateQR(selectedKey)}
                >
                  <span className="material-icons mr-1">qr_code</span>
                  Generate QR
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex-1 border-gray-700"
                >
                  <span className="material-icons mr-1">edit</span>
                  Edit
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
